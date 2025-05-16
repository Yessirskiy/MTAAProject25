## Testing

To run tests locally:
1. Ensure the requirements installed (pytest-asyncio)
2. Create separate test DB
3. Ensure the .env file has following definitions (with appropriate values):
```
TEST_DB_USER=username
TEST_DB_PASSWORD=password
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_NAME=mtaa_test
```
4. Run `pytest`