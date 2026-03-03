import traceback

from flask import Response

from util.sync_share_point_az import sync_all


def synchronize_with_sharepoint():
    try:
        sync_all()
    except Exception:
        traceback.print_exc()
        return Response("An internal error occurred. Please contact support.", 500)
    return "ok"
