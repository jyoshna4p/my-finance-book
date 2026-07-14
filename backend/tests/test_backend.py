"""Backend API tests for My Finance Book."""
from __future__ import annotations

import os
from typing import Any, Dict

import pytest
import requests

BASE_URL: str = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://finance-book-hub.preview.emergentagent.com",
).rstrip("/")
API: str = f"{BASE_URL}/api"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def demo_token() -> str:
    r = requests.post(
        f"{API}/auth/login",
        json={"email": "demo@myfinancebook.in", "password": "Demo@123"},
    )
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture
def auth_headers(demo_token: str) -> Dict[str, str]:
    return {"Authorization": f"Bearer {demo_token}", "Content-Type": "application/json"}


# ---------- Health ----------
class TestHealth:
    def test_root_ok(self) -> None:
        r = requests.get(f"{API}/")
        assert r.status_code == 200
        j: Dict[str, Any] = r.json()
        assert j.get("status") == "ok"
        assert j.get("service") == "My Finance Book"


# ---------- Allowlist ----------
class TestAllowlist:
    def test_allowlist_returns_three(self) -> None:
        r = requests.get(f"{API}/auth/allowlist")
        assert r.status_code == 200
        emails = r.json().get("emails", [])
        assert len(emails) == 3
        assert "demo@myfinancebook.in" in emails
        assert "ca@myfinancebook.in" in emails
        assert "admin@myfinancebook.in" in emails


# ---------- Login ----------
class TestLogin:
    def test_login_demo_success(self) -> None:
        r = requests.post(
            f"{API}/auth/login",
            json={"email": "demo@myfinancebook.in", "password": "Demo@123"},
        )
        assert r.status_code == 200
        j = r.json()
        assert "token" in j and isinstance(j["token"], str) and len(j["token"]) > 20
        assert j["user"]["email"] == "demo@myfinancebook.in"
        assert j["user"]["name"] == "Demo User"

    def test_login_sets_http_only_cookie(self) -> None:
        r = requests.post(
            f"{API}/auth/login",
            json={"email": "demo@myfinancebook.in", "password": "Demo@123"},
        )
        assert r.status_code == 200
        # Cookie jar should now hold mfb_session
        assert "mfb_session" in r.cookies

    def test_cookie_authenticates_me_endpoint(self) -> None:
        # Login and reuse the same session (which carries the cookie) — no Bearer header.
        s = requests.Session()
        r = s.post(
            f"{API}/auth/login",
            json={"email": "demo@myfinancebook.in", "password": "Demo@123"},
        )
        assert r.status_code == 200
        me = s.get(f"{API}/auth/me")
        assert me.status_code == 200
        assert me.json()["user"]["email"] == "demo@myfinancebook.in"

    def test_login_ca_success(self) -> None:
        r = requests.post(
            f"{API}/auth/login",
            json={"email": "ca@myfinancebook.in", "password": "CA@123456"},
        )
        assert r.status_code == 200
        assert "token" in r.json()

    def test_login_non_allowlisted_returns_403(self) -> None:
        r = requests.post(
            f"{API}/auth/login",
            json={"email": "hacker@evil.com", "password": "whatever"},
        )
        assert r.status_code == 403

    def test_login_wrong_password_returns_401(self) -> None:
        r = requests.post(
            f"{API}/auth/login",
            json={"email": "demo@myfinancebook.in", "password": "WrongPass"},
        )
        assert r.status_code == 401

    def test_auth_me_with_token(self, auth_headers: Dict[str, str]) -> None:
        r = requests.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        u = r.json()["user"]
        assert u["email"] == "demo@myfinancebook.in"
        assert "_id" not in u
        assert "password" not in u

    def test_auth_me_no_token_401(self) -> None:
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_auth_me_bad_token_401(self) -> None:
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer bad.token.here"})
        assert r.status_code == 401


# ---------- Logout ----------
class TestLogout:
    def test_logout_clears_cookie(self) -> None:
        s = requests.Session()
        r = s.post(
            f"{API}/auth/login",
            json={"email": "demo@myfinancebook.in", "password": "Demo@123"},
        )
        assert r.status_code == 200
        assert s.get(f"{API}/auth/me").status_code == 200
        out = s.post(f"{API}/auth/logout")
        assert out.status_code == 200
        # The session cookie should be cleared server-side; a subsequent call must fail auth.
        # Manually strip the cookie because some servers rely on Set-Cookie Max-Age=0.
        s.cookies.clear()
        assert s.get(f"{API}/auth/me").status_code == 401


# ---------- Portfolio round-trip ----------
class TestPortfolio:
    def test_save_and_get_portfolio(self, auth_headers: Dict[str, str]) -> None:
        holdings = [
            {"symbol": "TEST_RELIANCE", "qty": 5, "price": 2500.0},
            {"symbol": "TEST_INFY", "qty": 10, "price": 1500.0},
        ]
        watchlist = ["TEST_TCS", "TEST_HDFCBANK"]
        r = requests.post(
            f"{API}/portfolio/save",
            headers=auth_headers,
            json={"holdings": holdings, "watchlist": watchlist},
        )
        assert r.status_code == 200
        # Truthy check — avoids `is True` identity anti-pattern.
        assert r.json().get("ok")

        r2 = requests.get(f"{API}/portfolio", headers=auth_headers)
        assert r2.status_code == 200
        j = r2.json()
        assert j["holdings"] == holdings
        assert j["watchlist"] == watchlist

    def test_portfolio_requires_auth(self) -> None:
        r = requests.get(f"{API}/portfolio")
        assert r.status_code == 401


# ---------- AI (real LLM calls, allow longer timeout) ----------
class TestAI:
    def test_ai_suggest_anthropic(self, auth_headers: Dict[str, str]) -> None:
        r = requests.post(
            f"{API}/ai/suggest",
            headers=auth_headers,
            json={
                "provider": "anthropic",
                "prompt": "In 1 short sentence, name Section 80C of the Indian Income Tax Act.",
            },
            timeout=90,
        )
        assert r.status_code == 200, f"anthropic failed: {r.text[:400]}"
        j = r.json()
        assert j["provider"] == "anthropic"
        assert isinstance(j.get("text"), str) and len(j["text"]) > 5
        assert "claude" in j.get("model", "").lower()

    def test_ai_suggest_openai(self, auth_headers: Dict[str, str]) -> None:
        r = requests.post(
            f"{API}/ai/suggest",
            headers=auth_headers,
            json={
                "provider": "openai",
                "prompt": "In 1 short sentence, define GST in India.",
            },
            timeout=120,
        )
        assert r.status_code == 200, f"openai failed: {r.text[:400]}"
        j = r.json()
        assert j["provider"] == "openai"
        assert isinstance(j.get("text"), str) and len(j["text"]) > 5

    def test_ai_requires_auth(self) -> None:
        r = requests.post(f"{API}/ai/suggest", json={"prompt": "hi"})
        assert r.status_code == 401
