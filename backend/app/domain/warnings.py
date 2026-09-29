"""Plain-language hold warning in Russian, Kazakh, Uzbek and Kyrgyz."""

from dataclasses import dataclass

LANGUAGES = ("ru", "kk", "uz", "ky")

_TEXTS: dict[str, dict[str, str]] = {
    "ru": {
        "title": "Платёж приостановлен для вашей защиты",
        "body": "Мы задержали этот перевод на {minutes} минут. Сотрудники банка никогда "
        "не звонят и не просят перевести деньги на «безопасный счёт». "
        "Если вам сейчас звонят — положите трубку.",
        "action": "Подтвердите платёж, только если делаете его сами. "
        "Если об этом просят по телефону — нажмите «Это не я».",
        "confirm": "Подтверждаю, это я",
        "deny": "Это не я",
    },
    "kk": {
        "title": "Қауіпсіздігіңіз үшін төлем тоқтатылды",
        "body": "Біз бұл аударымды {minutes} минутқа кідірттік. Банк қызметкерлері ешқашан "
        "қоңырау шалып, ақшаны «қауіпсіз шотқа» аударуды сұрамайды. "
        "Қазір сізге қоңырау шалып жатса — тұтқаны қойыңыз.",
        "action": "Төлемді өзіңіз жасап жатсаңыз ғана растаңыз. "
        "Мұны телефон арқылы сұраса — «Бұл мен емеспін» батырмасын басыңыз.",
        "confirm": "Растаймын, бұл мен",
        "deny": "Бұл мен емеспін",
    },
    "uz": {
        "title": "Xavfsizligingiz uchun to'lov to'xtatildi",
        "body": "Biz bu o'tkazmani {minutes} daqiqaga to'xtatdik. Bank xodimlari hech qachon "
        "qo'ng'iroq qilib, pulni «xavfsiz hisob»ga o'tkazishni so'ramaydi. "
        "Hozir sizga qo'ng'iroq qilishayotgan bo'lsa — go'shakni qo'ying.",
        "action": "To'lovni faqat o'zingiz amalga oshirayotgan bo'lsangiz tasdiqlang. "
        "Buni telefon orqali so'rashsa — «Bu men emasman» tugmasini bosing.",
        "confirm": "Tasdiqlayman, bu men",
        "deny": "Bu men emasman",
    },
    "ky": {
        "title": "Коопсуздугуңуз үчүн төлөм токтотулду",
        "body": "Биз бул которууну {minutes} мүнөткө токтоттук. Банк кызматкерлери эч качан "
        "чалып, акчаны «коопсуз эсепке» которууну суранбайт. "
        "Азыр сизге чалып жатышса — трубканы коюңуз.",
        "action": "Төлөмдү өзүңүз жасап жатсаңыз гана ырастаңыз. "
        "Муну телефон аркылуу сурашса — «Бул мен эмесмин» баскычын басыңыз.",
        "confirm": "Ырастайм, бул мен",
        "deny": "Бул мен эмесмин",
    },
}

_SIGNALS: dict[str, dict[str, str]] = {
    "NEW_PAYEE": {
        "ru": "Новый получатель",
        "kk": "Жаңа алушы",
        "uz": "Yangi qabul qiluvchi",
        "ky": "Жаңы алуучу",
    },
    "UNUSUAL_AMOUNT": {
        "ru": "Сумма намного больше обычной",
        "kk": "Сома әдеттегіден әлдеқайда көп",
        "uz": "Summa odatdagidan ancha katta",
        "ky": "Сумма адаттагыдан бир топ көп",
    },
    "FIRST_LARGE_P2P": {
        "ru": "Первый крупный перевод человеку",
        "kk": "Адамға алғашқы ірі аударым",
        "uz": "Shaxsga birinchi yirik o'tkazma",
        "ky": "Адамга биринчи ири которуу",
    },
    "NEW_DEVICE": {
        "ru": "Вход с нового устройства",
        "kk": "Жаңа құрылғыдан кіру",
        "uz": "Yangi qurilmadan kirish",
        "ky": "Жаңы түзмөктөн кирүү",
    },
    "FAILED_OTP": {
        "ru": "Несколько неверных SMS-кодов",
        "kk": "Бірнеше қате SMS-код",
        "uz": "Bir necha marta noto'g'ri SMS-kod",
        "ky": "Бир нече жолу туура эмес SMS-код",
    },
}


@dataclass(frozen=True)
class HoldWarning:
    language: str
    title: str
    body: str
    action: str
    confirm_label: str
    deny_label: str
    reasons: list[str]


def build_warning(language: str, signals: list[str], hold_minutes: int) -> HoldWarning:
    lang = language if language in LANGUAGES else "ru"
    t = _TEXTS[lang]
    return HoldWarning(
        language=lang,
        title=t["title"],
        body=t["body"].format(minutes=hold_minutes),
        action=t["action"],
        confirm_label=t["confirm"],
        deny_label=t["deny"],
        reasons=[_SIGNALS[s][lang] for s in signals if s in _SIGNALS],
    )
