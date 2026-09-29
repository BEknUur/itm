class DomainError(Exception):
    pass


class NotFound(DomainError):
    pass


class InvalidPaymentState(DomainError):
    pass


class UntrustedDevice(DomainError):
    """Step-up attempted from a device the bank does not know — e.g. a fraudster."""


class StepUpLocked(DomainError):
    """Too many failed step-up attempts; only a contact-centre agent can decide now."""
