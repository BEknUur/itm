# SafeStep

Задерживаем рискованный платёж в момент Confirm на 30 минут и запрашиваем подтверждение в приложении, которое мошенник по телефону пройти не может.
Цикл: **Confirm → Score → Hold → Step-up / Fast-release**.

## Запуск

```bash
make up      # db + backend + frontend в Docker
make test    # тесты бэкенда (Postgres, база safestep_test)
make down    # остановить, данные сохраняются
make clean   # остановить и удалить базу
```

- Веб-интерфейс: http://localhost:3000 (слева приложение клиента, справа консоль контакт-центра)
- API-документация (Swagger): http://localhost:8001/docs
- Порты меняются через `WEB_PORT`, `API_PORT`, `DB_PORT` (по умолчанию 3000, 8001, 5433), см. `.env.example`
- Пороги риска банка (threshold, hold_minutes и т.д.) настраиваются в `backend/.env.example`. Скопируй его в `backend/.env`, Docker подхватит файл автоматически.

Для разработки без Docker: `make dev-db`, потом `make dev-api` и `make dev-web` → http://localhost:5173

## Демо для защиты (кнопки-сценарии над формой)

| Сценарий | Что происходит | Что показываем |
|---|---|---|
| Routine transfer | score 0 → SENT | обычные платежи не тормозятся |
| Fake “security service” call | score 75 → HOLD, предупреждение на казахском | переключаем язык RU/KZ/UZ/KY, жмём «Бұл мен емеспін» → CANCELLED, инцидент уходит в NAFC feed |
| Account takeover | score 100 → HOLD, вход с нового устройства | step-up с телефона мошенника → 403, после 3 попыток блокировка (423) |
| Genuine big payment | score 55 → HOLD | оператор справа жмёт **Fast-release** → у клиента слева «Transfer released» |

После этого нажимаем **Audit** у платежа (журнал событий) и **Export audit trail (CSV)**.

## Кто что защищает

| Фича (SIS3) | Кто | Backend | Frontend |
|---|---|---|---|
| Risk Score | Temirlan | `domain/risk_rules.py`, `use_cases/payments.py` (ConfirmPayment) | `features/confirm-payment` |
| Automatic Hold | Dias | `domain/entities.py` (Payment.hold), `core/config.py` (hold_minutes) | `entities/payment/ui` (HoldTimer), `widgets/hold-screen` |
| Step-up Verification | Beibars | `use_cases/step_up.py` | `features/step-up` |
| Multilingual Warning | Bekzat | `domain/warnings.py` | `features/select-language` |
| Fast-release | Beknur | `use_cases/fast_release.py`, `application/common.py` (HoldResolver) | `features/hold-decision`, `widgets/payments-queue` |
| Explainable Audit Trail | Temirlan | `use_cases/audit.py`, таблица `audit_events` | `entities/audit` |
| NAFC Connector (mock) | Beknur | `OutboxIncidentGateway` в `infrastructure/db/repositories.py` | `widgets/nafc-feed` |

## Архитектура

**Backend** (`backend/app`): FastAPI, Clean Architecture, DI через Dishka, Postgres (SQLAlchemy async + asyncpg).

```
domain/          сущности, правила скоринга, тексты предупреждений (без зависимостей от фреймворков)
application/     use cases + интерфейсы (Protocol): репозитории, AuditLog, IncidentGateway
infrastructure/  SQLAlchemy-модели, репозитории, outbox NAFC, seed демо-клиентов
presentation/    FastAPI-роутеры и pydantic-схемы (только вызывают use case)
core/            Settings (пороги банка, env SAFESTEP_*), Dishka providers
```

- **SOLID:** новое правило риска добавляется новым классом `RiskRule`, скорер при этом не меняется (OCP). Use cases зависят от интерфейсов, а не от SQLAlchemy (DIP).
- **DRY:** освобождение и отмену платежа выполняет один `HoldResolver`, его используют и клиентский step-up, и оператор.
- **KISS:** нет воркеров. Истечение hold считается по `hold_until`, а после истечения платёж **не уходит сам** и ждёт решения.

**Frontend** (`frontend/src`): React + Vite + TS, Feature-Sliced Design.
Слои `app → pages → widgets → features → entities → shared`. Каждый слой импортирует только нижние слои, и только через `index.ts` слайса.

## Вне скоупа MVP

Data lake, ML-модель, voice callback, self-service отмена, живая интеграция с Антифрод-центром (сейчас outbox), Alembic-миграции (сейчас `create_all`).
