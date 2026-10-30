"""
Civic Pulse root package initialization.
"""

from __future__ import annotations

import json
import sys
import types

# Ensure pure-Python JSON fallback for jiter if blocked by Windows Application Control policies
try:
    import jiter  # noqa: F401
except ImportError:
    shim = types.ModuleType("jiter")

    def _from_json(data, partial_mode=None, **kwargs):
        if isinstance(data, (bytes, bytearray)):
            data = data.decode("utf-8", errors="ignore")
        try:
            return json.loads(data)
        except Exception:
            return {}

    shim.from_json = _from_json
    sys.modules["jiter"] = shim
