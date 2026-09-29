const ru = {
  'app.tagline': 'Проверка и удержание рискованного платежа в момент подтверждения',
  'app.loop.confirm': 'Подтверждение',
  'app.loop.score': 'Оценка риска',
  'app.loop.hold': 'Удержание',
  'app.loop.resolve': 'Проверка / быстрое снятие',
  'app.pane.customer': 'Клиент · мобильный банк',
  'app.pane.bank': 'Банк · контакт-центр',

  'common.loading': 'Загрузка…',
  'common.backendDown': 'Сервер недоступен: {msg}',

  'phone.transfer': 'Перевод',
  'phone.newTransfer': 'Новый перевод',
  'phone.riskScore': 'Оценка риска',
  'outcome.SENT.title': 'Перевод отправлен',
  'outcome.SENT.text': 'Низкий риск — платёж ушёл сразу, без дополнительных шагов.',
  'outcome.RELEASED.title': 'Перевод подтверждён',
  'outcome.RELEASED.text': 'Подтверждён на устройстве владельца или сотрудником контакт-центра.',
  'outcome.CANCELLED.title': 'Перевод остановлен',
  'outcome.CANCELLED.text': 'Деньги не покинули счёт. Инцидент передан в Антифрод-центр.',

  'form.customer': 'Клиент',
  'form.device': 'Вход с устройства',
  'form.notTrusted': 'не доверенное',
  'form.payee': 'Получатель',
  'form.amount': 'Сумма',
  'form.failedOtp': 'Неверные SMS-коды',
  'form.submit': 'Подтвердить перевод',
  'form.scoring': 'Оцениваем риск…',

  'scenario.routine.title': 'Обычный перевод',
  'scenario.routine.hint': 'Знакомый получатель, обычная сумма, свой телефон → проходит',
  'scenario.fakeCall.title': 'Звонок «службы безопасности»',
  'scenario.fakeCall.hint': 'Звонящий требует перевод на «безопасный счёт» → удержание, клиент жмёт «Это не я»',
  'scenario.takeover.title': 'Захват аккаунта',
  'scenario.takeover.hint': 'Мошенник на новом устройстве, неверные коды → удержание, подтверждение с его телефона не проходит',
  'scenario.genuine.title': 'Настоящий крупный платёж',
  'scenario.genuine.hint': 'Покупка машины поднимает риск → контакт-центр быстро снимает удержание',

  'stepUp.push': 'Push-запрос на {device}. Подтвердить может только доверенный телефон владельца.',

  'decision.reason': 'Причина (необязательно)',
  'decision.release': 'Отпустить платёж',
  'decision.cancel': 'Отменить как мошенничество',
  'decision.defaultRelease': 'клиент подтвердил по телефону, платёж настоящий',
  'decision.defaultCancel': 'подтверждённое мошенничество',

  'queue.title': 'Платежи на удержании',
  'queue.heldOnly': 'Только удержанные',
  'queue.emptyHeld': 'Нет платежей, ожидающих решения.',
  'queue.empty': 'Платежей пока нет.',
  'queue.col.time': 'Время',
  'queue.col.customer': 'Клиент',
  'queue.col.payee': 'Получатель',
  'queue.col.amount': 'Сумма',
  'queue.col.score': 'Риск',
  'queue.col.signals': 'Сигналы',
  'queue.col.status': 'Статус',
  'queue.col.hold': 'Удержание',
  'queue.audit': 'Журнал',
  'queue.hide': 'Скрыть',

  'centre.agent': 'Оператор',
  'centre.export': 'Выгрузить журнал (CSV)',

  'nafc.title': 'Лента Антифрод-центра',
  'nafc.subtitle': 'только чтение · макет пилота',
  'nafc.empty': 'Инцидентов пока нет.',

  'audit.loading': 'Загрузка журнала…',

  'payment.noSignals': 'нет сигналов',
  'payment.scoreTitle': 'Оценка риска, 0–100',
  'payment.expired': 'время вышло, нужно решение',
  'signal.NEW_PAYEE': 'Новый получатель',
  'signal.UNUSUAL_AMOUNT': 'Необычная сумма',
  'signal.FIRST_LARGE_P2P': 'Первый крупный P2P',
  'signal.NEW_DEVICE': 'Новое устройство',
  'signal.FAILED_OTP': 'Неверные OTP',
  'status.SENT': 'Отправлен',
  'status.HELD': 'Удержан',
  'status.RELEASED': 'Отпущен',
  'status.CANCELLED': 'Отменён',

  'error.403': 'Подтвердить можно только с собственного устройства клиента',
  'error.404': 'Не найдено',
  'error.409': 'По этому платежу решение уже принято',
  'error.423': 'Слишком много попыток. Решение примет оператор контакт-центра.',
}

export type Key = keyof typeof ru

// Record<Key, string> makes tsc fail if a Kazakh string is missing.
const kk: Record<Key, string> = {
  'app.tagline': 'Растау сәтінде тәуекелді төлемді тексеру және ұстап тұру',
  'app.loop.confirm': 'Растау',
  'app.loop.score': 'Тәуекелді бағалау',
  'app.loop.hold': 'Ұстап тұру',
  'app.loop.resolve': 'Тексеру / жедел босату',
  'app.pane.customer': 'Клиент · мобильді банк',
  'app.pane.bank': 'Банк · байланыс орталығы',

  'common.loading': 'Жүктелуде…',
  'common.backendDown': 'Сервер қолжетімсіз: {msg}',

  'phone.transfer': 'Аударым',
  'phone.newTransfer': 'Жаңа аударым',
  'phone.riskScore': 'Тәуекел бағасы',
  'outcome.SENT.title': 'Аударым жіберілді',
  'outcome.SENT.text': 'Тәуекел төмен — төлем бірден, қосымша қадамсыз жіберілді.',
  'outcome.RELEASED.title': 'Аударым расталды',
  'outcome.RELEASED.text': 'Иесінің құрылғысында немесе байланыс орталығының қызметкері растады.',
  'outcome.CANCELLED.title': 'Аударым тоқтатылды',
  'outcome.CANCELLED.text': 'Ақша шоттан шыққан жоқ. Оқиға Антифрод орталығына жіберілді.',

  'form.customer': 'Клиент',
  'form.device': 'Кірген құрылғы',
  'form.notTrusted': 'сенімсіз',
  'form.payee': 'Алушы',
  'form.amount': 'Сома',
  'form.failedOtp': 'Қате SMS-кодтар',
  'form.submit': 'Аударымды растау',
  'form.scoring': 'Тәуекел бағалануда…',

  'scenario.routine.title': 'Кәдімгі аударым',
  'scenario.routine.hint': 'Таныс алушы, әдеттегі сома, өз телефоны → өтеді',
  'scenario.fakeCall.title': '«Қауіпсіздік қызметінің» қоңырауы',
  'scenario.fakeCall.hint': 'Қоңырау шалушы «қауіпсіз шотқа» аударуды талап етеді → ұстау, клиент «Бұл мен емеспін» басады',
  'scenario.takeover.title': 'Аккаунтты басып алу',
  'scenario.takeover.hint': 'Алаяқ жаңа құрылғыда, қате кодтар → ұстау, оның телефонынан растау өтпейді',
  'scenario.genuine.title': 'Нақты ірі төлем',
  'scenario.genuine.hint': 'Көлік сатып алу тәуекелді көтереді → байланыс орталығы ұстауды жедел алады',

  'stepUp.push': '{device} құрылғысына push-сұрау. Тек иесінің сенімді телефоны раста алады.',

  'decision.reason': 'Себебі (міндетті емес)',
  'decision.release': 'Төлемді босату',
  'decision.cancel': 'Алаяқтық деп тоқтату',
  'decision.defaultRelease': 'клиент телефон арқылы растады, төлем нақты',
  'decision.defaultCancel': 'расталған алаяқтық',

  'queue.title': 'Ұсталған төлемдер',
  'queue.heldOnly': 'Тек ұсталғандар',
  'queue.emptyHeld': 'Шешім күтіп тұрған төлем жоқ.',
  'queue.empty': 'Әзірге төлем жоқ.',
  'queue.col.time': 'Уақыт',
  'queue.col.customer': 'Клиент',
  'queue.col.payee': 'Алушы',
  'queue.col.amount': 'Сома',
  'queue.col.score': 'Тәуекел',
  'queue.col.signals': 'Белгілер',
  'queue.col.status': 'Мәртебе',
  'queue.col.hold': 'Ұстау',
  'queue.audit': 'Журнал',
  'queue.hide': 'Жасыру',

  'centre.agent': 'Оператор',
  'centre.export': 'Журналды жүктеу (CSV)',

  'nafc.title': 'Антифрод орталығының арнасы',
  'nafc.subtitle': 'тек оқу · пилоттық макет',
  'nafc.empty': 'Әзірге оқиға жоқ.',

  'audit.loading': 'Журнал жүктелуде…',

  'payment.noSignals': 'белгі жоқ',
  'payment.scoreTitle': 'Тәуекел бағасы, 0–100',
  'payment.expired': 'уақыты өтті, шешім керек',
  'signal.NEW_PAYEE': 'Жаңа алушы',
  'signal.UNUSUAL_AMOUNT': 'Әдеттен тыс сома',
  'signal.FIRST_LARGE_P2P': 'Алғашқы ірі P2P',
  'signal.NEW_DEVICE': 'Жаңа құрылғы',
  'signal.FAILED_OTP': 'Қате OTP',
  'status.SENT': 'Жіберілді',
  'status.HELD': 'Ұсталды',
  'status.RELEASED': 'Босатылды',
  'status.CANCELLED': 'Тоқтатылды',

  'error.403': 'Тек клиенттің өз құрылғысынан растауға болады',
  'error.404': 'Табылмады',
  'error.409': 'Бұл төлем бойынша шешім қабылданып қойған',
  'error.423': 'Әрекет тым көп. Шешімді байланыс орталығының операторы қабылдайды.',
}

export type Locale = 'ru' | 'kk'

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'ru', label: 'РУС' },
  { code: 'kk', label: 'ҚАЗ' },
]

export const DICTIONARIES: Record<Locale, Record<Key, string>> = { ru, kk }
