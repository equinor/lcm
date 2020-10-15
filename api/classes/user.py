class User:
    def __init__(self, name, oid, roles=None, **kwargs):
        self.name = name
        self.oid = oid
        self.roles = roles if roles else []
