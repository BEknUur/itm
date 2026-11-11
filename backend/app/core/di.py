from collections.abc import AsyncIterator

from dishka import (
    AsyncContainer,
    Provider,
    Scope,
    from_context,
    make_async_container,
    provide,
    provide_all,
)
from dishka.integrations.fastapi import FastapiProvider
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.application.common import HoldPolicy, HoldResolver
from app.application.interfaces import (
    AuditLog,
    CustomerRepository,
    IncidentGateway,
    PaymentRepository,
    TransactionManager,
)
from app.application.use_cases.audit import ExportAuditCsv, GetAuditTrail, ListIncidents
from app.application.use_cases.analytics import GetOperationsAnalytics
from app.application.use_cases.fast_release import CancelHold, ListHolds, ListPayments, ReleaseHold
from app.application.use_cases.payments import (
    ConfirmPayment,
    GetHoldWarning,
    GetPayment,
    ListCustomers,
)
from app.application.use_cases.step_up import ApproveStepUp, DenyStepUp
from app.core.config import Settings
from app.domain.risk_rules import (
    FailedOtp,
    FirstLargeP2P,
    NewDevice,
    NewPayee,
    RiskScorer,
    UnusualAmount,
)
from app.infrastructure.db.repositories import (
    OutboxIncidentGateway,
    SqlAuditLog,
    SqlCustomerRepository,
    SqlPaymentRepository,
    SqlTransactionManager,
)


class InfrastructureProvider(Provider):
    settings = from_context(provides=Settings, scope=Scope.APP)

    @provide(scope=Scope.APP)
    async def engine(self, settings: Settings) -> AsyncIterator[AsyncEngine]:
        engine = create_async_engine(settings.database_url)
        yield engine
        await engine.dispose()

    @provide(scope=Scope.APP)
    def session_factory(self, engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
        return async_sessionmaker(engine, expire_on_commit=False)

    @provide(scope=Scope.REQUEST)
    async def session(
        self, factory: async_sessionmaker[AsyncSession]
    ) -> AsyncIterator[AsyncSession]:
        async with factory() as session:
            yield session

    customers = provide(SqlCustomerRepository, scope=Scope.REQUEST, provides=CustomerRepository)
    payments = provide(SqlPaymentRepository, scope=Scope.REQUEST, provides=PaymentRepository)
    audit = provide(SqlAuditLog, scope=Scope.REQUEST, provides=AuditLog)
    gateway = provide(OutboxIncidentGateway, scope=Scope.REQUEST, provides=IncidentGateway)
    tx = provide(SqlTransactionManager, scope=Scope.REQUEST, provides=TransactionManager)


class DomainProvider(Provider):
    @provide(scope=Scope.APP)
    def scorer(self, s: Settings) -> RiskScorer:
        return RiskScorer(
            [
                NewPayee(),
                UnusualAmount(multiplier=s.unusual_amount_multiplier),
                FirstLargeP2P(large_amount=s.large_p2p_amount),
                NewDevice(),
                FailedOtp(min_failures=s.failed_otp_min),
            ]
        )

    @provide(scope=Scope.APP)
    def policy(self, s: Settings) -> HoldPolicy:
        return HoldPolicy(
            risk_threshold=s.risk_threshold,
            hold_minutes=s.hold_minutes,
            max_step_up_attempts=s.max_step_up_attempts,
        )


class UseCaseProvider(Provider):
    scope = Scope.REQUEST

    use_cases = provide_all(
        HoldResolver,
        ConfirmPayment,
        GetPayment,
        GetHoldWarning,
        ListCustomers,
        ApproveStepUp,
        DenyStepUp,
        ListHolds,
        ListPayments,
        ReleaseHold,
        CancelHold,
        GetAuditTrail,
        ExportAuditCsv,
        ListIncidents,
        GetOperationsAnalytics,
    )


def build_container(settings: Settings) -> AsyncContainer:
    return make_async_container(
        InfrastructureProvider(),
        DomainProvider(),
        UseCaseProvider(),
        FastapiProvider(),
        context={Settings: settings},
    )
