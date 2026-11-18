# Natour Loyalty — standalone starter

Independent loyalty platform for Natour Clinic. It does **not** connect to the clinic website.
- Backend: Django + Django REST Framework
- Frontend: React + Vite
- Database: PostgreSQL (SQLite works locally for a quick start)
- Customer identity: phone number + password (OTP/SMS provider is intentionally not configured)

## Important scope
This is a runnable foundation, not a production-ready medical/financial system. Before launch:
1. Choose the actual point formula, expiry policy, reward catalogue and currency.
2. Configure a real SMS/OTP provider and rate limits.
3. Add deployment secrets, HTTPS, backups, monitoring and security review.
4. Have clinic staff approve each completed service before points are issued.
5. Review local privacy/consumer rules. Avoid storing treatment/medical details in loyalty records.

## Run backend
```bash
cd backend
python -m venv .venv
# activate the venv, then:
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
API root: `http://127.0.0.1:8000/api/`
Admin: `http://127.0.0.1:8000/admin/`

## Run frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend expects API at `http://127.0.0.1:8000/api`. Change `VITE_API_URL` in `.env` if needed.

## Initial API
- `POST /api/auth/register/` `{ "phone": "...", "password": "...", "first_name": "..." }`
- `POST /api/auth/token/` `{ "phone": "...", "password": "..." }` → JWT
- `GET /api/loyalty/me/` authenticated customer balance + recent ledger
- `GET /api/loyalty/services/` active point-earning services
- `GET /api/loyalty/rewards/` active rewards
- `POST /api/loyalty/redeem/` `{ "reward_id": 1 }` authenticated customer
- Admin creates completed service transactions through Django Admin initially.
  A dedicated staff workflow/QR scanning endpoint is a next implementation step; do not expose a public endpoint that can mint points.

## Architecture
`accounts` owns phone-based accounts. `loyalty` owns service rules, rewards, immutable point ledger and redemptions.
Every balance change is a ledger entry. Do not directly edit a customer's balance.
