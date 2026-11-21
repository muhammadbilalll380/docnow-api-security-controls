# DocNow API: Security Controls

Adds three security controls to the DocNow API:

- **JWT authentication:** `POST /login` returns a signed JWT; all other endpoints need `Authorization: Bearer <token>`
- **Input validation:** zod schemas reject bad or extra fields and malformed JSON with 400
- **Rate limiting:** token bucket (`limiter` library), 20 requests/minute per IP, 429 when exceeded

## Setup
```
npm install
export JWT_SECRET="change-me"
npm start
```
The secret can also be loaded from a Docker secret via `JWT_SECRET_FILE=/run/secrets/jwt_secret`.

## Tests
```
npm test
```
14 unit tests in `tests/security.test.js`.

## Limitations
- Demo user is hardcoded; a real system needs a database with hashed passwords.
- Rate-limit buckets are in memory (single instance only).
