from dataclasses import dataclass, field


@dataclass
class User:
    name: str
    oid: str
    roles: list[str] = field(default_factory=list)
