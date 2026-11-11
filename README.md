# SafeStep

Задерживаем рискованный платёж в момент Confirm на 30 минут и запрашиваем подтверждение в приложении, которое мошенник по телефону пройти не может.
Цикл: **Confirm → Score → Hold → Step-up / Fast-release**.

## Запуск

```bash
make up      # db + backend + frontend в Docker
make test    # тесты бэкенда (Postgres, база safestep_test)
make down    # остановить, данные сохраняются
make clean   # остановить и удалить базу
```

- Веб-интерфейс: http://localhost:3000 (разделы клиента, оператора, аналитики и совместная демонстрация)
- API-документация (Swagger): http://localhost:8001/docs
- Порты меняются через `WEB_PORT`, `API_PORT`, `DB_PORT` (по умолчанию 3000, 8001, 5433), см. `.env.example`
- Пороги риска банка (threshold, hold_minutes и т.д.) настраиваются в `backend/.env.example`. Скопируй его в `backend/.env`, Docker подхватит файл автоматически.

Для разработки без Docker: `make dev-db`, потом `make dev-api` и `make dev-web` → http://localhost:5173

Если стандартные порты заняты, не останавливайте чужие сервисы:

```bash
DB_PORT=55433 API_PORT=18001 WEB_PORT=13000 docker compose up --build -d
```

В этом случае веб-интерфейс доступен на http://localhost:13000, Swagger — на http://localhost:18001/docs.

## SIS 10–11

Материалы команды находятся в `SIS 10-11/`: 11 Word-документов и `SIS10-11.pptx`.
Это учебный MVP: профили и переводы демонстрационные, реальные деньги не перемещаются.
NAFC — локальный outbox, а не живое подключение. Выбор раздела/имени оператора не является авторизацией;
совпадение `device_id` не доказывает владение физическим устройством.

- **ISS-06:** непустая причина решения оператора обязательна в UI и API; автоматической подстановки нет.
- **ISS-04:** ошибка загрузки предупреждения отображается с повторным запросом.
- **CR-01:** поиск по началу всего `customer_id` или `payee`, без учёта регистра и пробелов по краям запроса.
  `aig` находит `aigerim`, `ge` — нет; `KZ12` находит `KZ12 Mother`, `Mother` — нет.
  Статусы: All / Held / Sent / Released / Cancelled; изначально Held; очистка сбрасывает запрос и выбирает All.
- Дополнительно: восстановление выбранного платежа после перезагрузки, обновлённый светлый интерфейс
  с собственной маркой SafeStep и отдельная операционная аналитика (`backend/ANALYTICS.md`).
  Аналитика не подменяет CR-01 из документов команды.

Техническая реализация в этой итерации — Beknur; материалы и проверка документов — командная работа.
Роли в таблице ниже обозначают темы защиты, а не подтверждённое авторство изменений кода.

Проверка (PostgreSQL должен работать; тесты удаляют таблицы **только в разрешённой тестовой БД**):

```bash
cd backend
uv run pytest -q
```

Для нестандартного порта передайте `SAFESTEP_TEST_DATABASE_URL` с БД `safestep_test`
или `safestep_sis1011_test`. Не используйте рабочую БД приложения.

Во `frontend/`: `npm ci`, `npm test`, `npm run lint`, `npm run build`.
Браузерные проверки и снимки находятся в `qa/` и `SIS 10-11/evidence/`.
Итоговое соответствие требованиям и реальные результаты: `SIS 10-11/IMPLEMENTATION-VERIFICATION.md`.
Исторические количества тестов в Word не следует выдавать за результаты новой версии:
ориентируйтесь на свежие журналы запуска и приложение к сдаче.

## Демо для защиты (кнопки-сценарии над формой)

| Сценарий | Что происходит | Что показываем |
|---|---|---|
| Routine transfer | score 0 → SENT | обычные платежи не тормозятся |
| Fake “security service” call | score 75 → HOLD, предупреждение на казахском | переключаем язык RU/KZ/UZ/KY, жмём «Бұл мен емеспін» → CANCELLED, инцидент уходит в NAFC feed |
| Account takeover | score 100 → HOLD, вход с нового устройства | step-up с телефона мошенника → 403, после 3 попыток блокировка (423) |
| Genuine big payment | score 55 → HOLD | оператор справа жмёт **Fast-release** → у клиента слева «Transfer released» |

После этого нажимаем **Audit** у платежа (журнал событий) и **Export audit trail (CSV)**.

## Кто что защищает

| Фича (SIS3) | Кто | Backend | Frontend |
|---|---|---|---|
| Risk Score | Temirlan | `domain/risk_rules.py`, `use_cases/payments.py` (ConfirmPayment) | `features/confirm-payment` |
| Automatic Hold | Dias | `domain/entities.py` (Payment.hold), `core/config.py` (hold_minutes) | `entities/payment/ui` (HoldTimer), `widgets/hold-screen` |
| Step-up Verification | Beibars | `use_cases/step_up.py` | `features/step-up` |
| Multilingual Warning | Bekzat | `domain/warnings.py` | `features/select-language` |
| Fast-release | Beknur | `use_cases/fast_release.py`, `application/common.py` (HoldResolver) | `features/hold-decision`, `widgets/payments-queue` |
| Explainable Audit Trail | Temirlan | `use_cases/audit.py`, таблица `audit_events` | `entities/audit` |
| NAFC Connector (mock) | Beknur | `OutboxIncidentGateway` в `infrastructure/db/repositories.py` | `widgets/nafc-feed` |

## Архитектура

**Backend** (`backend/app`): FastAPI, Clean Architecture, DI через Dishka, Postgres (SQLAlchemy async + asyncpg).

```
domain/          сущности, правила скоринга, тексты предупреждений (без зависимостей от фреймворков)
application/     use cases + интерфейсы (Protocol): репозитории, AuditLog, IncidentGateway
infrastructure/  SQLAlchemy-модели, репозитории, outbox NAFC, seed демо-клиентов
presentation/    FastAPI-роутеры и pydantic-схемы (только вызывают use case)
core/            Settings (пороги банка, env SAFESTEP_*), Dishka providers
```

- **SOLID:** новое правило риска добавляется новым классом `RiskRule`, скорер при этом не меняется (OCP). Use cases зависят от интерфейсов, а не от SQLAlchemy (DIP).
- **DRY:** освобождение и отмену платежа выполняет один `HoldResolver`, его используют и клиентский step-up, и оператор.
- **KISS:** нет воркеров. Истечение hold считается по `hold_until`, а после истечения платёж **не уходит сам** и ждёт решения.

**Frontend** (`frontend/src`): React + Vite + TS, Feature-Sliced Design.
Слои `app → pages → widgets → features → entities → shared`. Каждый слой импортирует только нижние слои, и только через `index.ts` слайса.

## Вне скоупа MVP

Data lake, ML-модель, voice callback, живая интеграция с Антифрод-центром (сейчас outbox), Alembic-миграции (сейчас `create_all`).
