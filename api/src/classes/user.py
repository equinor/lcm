from dataclasses import dataclass, field


@dataclass
class User:
    name: str
    oid: str
    roles: list[str] = field(default_factory=list)

    @classmethod
    def from_jwt(cls, jwt_payload: dict):
        return cls(
            name=jwt_payload.get("name", ""),
            oid=jwt_payload.get("oid", ""),
            roles=jwt_payload.get("roles", []),
        )
