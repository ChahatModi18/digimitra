"""Discovery Provider Adapter Strategy & Fallback System (A8).

Adheres strictly to the A8 Specification:
- Zero fabrication guarantee: Never invents fake addresses, ratings, or phone numbers.
- Unconfigured state: Gracefully returns an empty state with official MSME portal guidance.
- Test mode: Deterministic mock provider enabled only when explicitly requested in test fixtures.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Tuple
from app.schemas.discovery import ServiceProviderItem, ServiceSearchQuery


class BaseDiscoveryProvider(ABC):
    """Abstract interface for location and service discovery providers."""

    @abstractmethod
    def search_services(
        self, query: ServiceSearchQuery
    ) -> Tuple[List[ServiceProviderItem], int, str, str, str]:
        """
        Executes service search.

        Returns:
            Tuple of (items, total_count, status_code, message_en, message_hi)
        """
        pass


class EmptyFallbackProvider(BaseDiscoveryProvider):
    """
    Default production provider when no external location provider is configured.
    Returns zero fabricated records, a clear status, and guidance to official resources.
    """

    def search_services(
        self, query: ServiceSearchQuery
    ) -> Tuple[List[ServiceProviderItem], int, str, str, str]:
        status_code = "empty_unconfigured"
        msg_en = (
            "No third-party local service providers are currently configured for your area. "
            "You can register and explore official support via Udyam Assist and your local District Industries Centre (DIC)."
        )
        msg_hi = (
            "वर्तमान में आपके क्षेत्र के लिए कोई तृतीय-पक्ष सेवा प्रदाता कॉन्फ़िगर नहीं है। "
            "आप उद्यम असिस्ट और अपने स्थानीय जिला उद्योग केंद्र (DIC) के माध्यम से आधिकारिक सहायता प्राप्त कर सकते हैं।"
        )
        return [], 0, status_code, msg_en, msg_hi


class DeterministicMockProvider(BaseDiscoveryProvider):
    """
    Deterministic mock provider used strictly in automated test suites and unit testing.
    All records are clearly marked with is_mock_data=True and '[MOCK — TEST ONLY]'.
    """

    SAMPLE_DATA: List[ServiceProviderItem] = [
        ServiceProviderItem(
            id="mock-pay-01",
            name="[MOCK — TEST ONLY] Bharat Digital Merchant Services",
            category_id="payments",
            locality="Civil Lines",
            district="Jaipur",
            state="Rajasthan",
            pincode="302006",
            short_description_en="Authorized UPI QR soundbox and point-of-sale terminal support for local retail shops.",
            short_description_hi="स्थानीय खुदरा दुकानों के लिए अधिकृत यूपीआई क्यूआर साउंडबॉक्स और पीओएस टर्मिनल सहायता।",
            is_official_resource=False,
            website_url="https://example.com/mock-payments",
            contact_phone="1800-000-0000",
            action_label_en="View Details",
            action_label_hi="विवरण देखें",
            action_url="https://example.com/mock-payments",
            is_mock_data=True,
        ),
        ServiceProviderItem(
            id="mock-acc-01",
            name="[MOCK — TEST ONLY] MSME Bookkeeping & GST Hub",
            category_id="accounting",
            locality="Connaught Place",
            district="New Delhi",
            state="Delhi",
            pincode="110001",
            short_description_en="Digital invoicing, ledger bookkeeping and GST compliance assistance for micro enterprises.",
            short_description_hi="सूक्ष्म उद्यमों के लिए डिजिटल इनवॉयसिंग, बहीखाता और जीएसटी अनुपालन सहायता।",
            is_official_resource=False,
            website_url="https://example.com/mock-accounting",
            contact_phone="1800-000-0001",
            action_label_en="View Details",
            action_label_hi="विवरण देखें",
            action_url="https://example.com/mock-accounting",
            is_mock_data=True,
        ),
        ServiceProviderItem(
            id="mock-web-01",
            name="[MOCK — TEST ONLY] Digital Gramin Web & ONDC Enabler",
            category_id="website",
            locality="Indiranagar",
            district="Bengaluru Urban",
            state="Karnataka",
            pincode="560038",
            short_description_en="Simple mobile-friendly website development and direct onboarding to ONDC network.",
            short_description_hi="सरल मोबाइल-अनुकूल वेबसाइट विकास और ओएनडीसी नेटवर्क पर सीधा ऑनबोर्डिंग।",
            is_official_resource=False,
            website_url="https://example.com/mock-web",
            contact_phone="1800-000-0002",
            action_label_en="View Details",
            action_label_hi="विवरण देखें",
            action_url="https://example.com/mock-web",
            is_mock_data=True,
        ),
        ServiceProviderItem(
            id="mock-gov-01",
            name="[MOCK — TEST ONLY] District Industries Centre (DIC) Helpdesk",
            category_id="msme_support",
            locality="Collectorate Compound",
            district="Pune",
            state="Maharashtra",
            pincode="411001",
            short_description_en="Government MSME registration, PMEGP subsidy counseling, and digital scheme guidance.",
            short_description_hi="सरकारी एमएसएमई पंजीकरण, पीएमईजीपी सब्सिडी परामर्श एवं डिजिटल योजना मार्गदर्शन।",
            is_official_resource=True,
            website_url="https://msme.gov.in",
            contact_phone="011-23063800",
            action_label_en="Open Official Portal",
            action_label_hi="आधिकारिक पोर्टल खोलें",
            action_url="https://msme.gov.in",
            is_mock_data=True,
        ),
    ]

    def search_services(
        self, query: ServiceSearchQuery
    ) -> Tuple[List[ServiceProviderItem], int, str, str, str]:
        filtered = self.SAMPLE_DATA

        if query.category:
            cat_lower = query.category.lower().strip()
            filtered = [item for item in filtered if item.category_id.lower() == cat_lower]

        if query.state:
            state_lower = query.state.lower().strip()
            filtered = [item for item in filtered if state_lower in item.state.lower()]

        if query.district:
            dist_lower = query.district.lower().strip()
            filtered = [
                item for item in filtered if item.district and dist_lower in item.district.lower()
            ]

        if query.search_term:
            term = query.search_term.lower().strip()
            filtered = [
                item
                for item in filtered
                if term in item.name.lower()
                or term in item.short_description_en.lower()
                or (item.short_description_hi and term in item.short_description_hi.lower())
                or (item.locality and term in item.locality.lower())
            ]

        total = len(filtered)
        start = (query.page - 1) * query.page_size
        end = start + query.page_size
        items = filtered[start:end]

        msg_en = f"Found {total} test service provider(s) [MOCK TEST MODE]."
        msg_hi = f"{total} परीक्षण सेवा प्रदाता मिले [MOCK TEST MODE]।"
        return items, total, "mock_test", msg_en, msg_hi


def get_discovery_provider(use_test_mock: bool = False) -> BaseDiscoveryProvider:
    """
    Factory resolving the active discovery provider adapter.
    Defaults safely to EmptyFallbackProvider unless explicitly flagged for tests.
    """
    if use_test_mock:
        return DeterministicMockProvider()
    return EmptyFallbackProvider()
