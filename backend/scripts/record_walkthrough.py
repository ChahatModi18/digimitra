"""Record end-to-end user walkthrough screenshots and video using Playwright."""
import asyncio
import os
import pathlib
from playwright.async_api import async_playwright

ARTIFACT_DIR = pathlib.Path(
    r"C:\Users\Lenovo\.gemini\antigravity-ide\brain\fe058c7e-8631-407c-949f-2cc337598d02"
)
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
VIDEO_DIR = ARTIFACT_DIR / "walkthrough_video"
VIDEO_DIR.mkdir(parents=True, exist_ok=True)

async def main():
    async with async_playwright() as p:
        # Launch using installed Edge or Chrome
        browser = None
        for channel in ["msedge", "chrome"]:
            try:
                browser = await p.chromium.launch(
                    channel=channel,
                    headless=True,
                    args=["--no-sandbox", "--disable-dev-shm-usage"]
                )
                print(f"Launched browser with channel: {channel}")
                break
            except Exception as e:
                print(f"Failed with channel {channel}: {e}")

        if not browser:
            print("Could not launch browser")
            return

        context = await browser.new_context(
            viewport={"width": 1366, "height": 850},
            record_video_dir=str(VIDEO_DIR),
            record_video_size={"width": 1280, "height": 720}
        )
        page = await context.new_page()

        print("1. Navigating to http://localhost:5173/")
        await page.goto("http://localhost:5173/", wait_until="domcontentloaded")
        await asyncio.sleep(1)
        await page.screenshot(
            path=str(ARTIFACT_DIR / "01_dashboard_home.png"),
            full_page=False
        )
        print("Captured 01_dashboard_home.png")

        print("2. Opening Transformation Roadmap Flashcard Modal...")
        roadmap_flashcard_btn = page.locator('button[aria-label="View Roadmap Flashcard"]').first
        if await roadmap_flashcard_btn.count() > 0:
            await roadmap_flashcard_btn.click()
            await asyncio.sleep(0.8)
            await page.screenshot(
                path=str(ARTIFACT_DIR / "02_roadmap_flashcard_modal.png"),
                full_page=False
            )
            print("Captured 02_roadmap_flashcard_modal.png")
            # Close modal
            close_btn = page.locator('button[aria-label="Close dialog"]').first
            if await close_btn.count() > 0:
                await close_btn.click()
                await asyncio.sleep(0.5)

        print("3. Opening Recommendations Flashcard Modal...")
        rec_flashcard_btn = page.locator('button[aria-label="View Recommendations Flashcard"]').first
        if await rec_flashcard_btn.count() > 0:
            await rec_flashcard_btn.click()
            await asyncio.sleep(0.8)
            await page.screenshot(
                path=str(ARTIFACT_DIR / "03_recommendations_flashcard_modal.png"),
                full_page=False
            )
            print("Captured 03_recommendations_flashcard_modal.png")
            close_btn = page.locator('button[aria-label="Close dialog"]').first
            if await close_btn.count() > 0:
                await close_btn.click()
                await asyncio.sleep(0.5)

        print("4. Scrolling to 9 dimensions and clicking 'Digital Infrastructure'...")
        dim_card = page.locator('h4:has-text("Digital Infrastructure")').first
        if await dim_card.count() > 0:
            await dim_card.scroll_into_view_if_needed()
            await asyncio.sleep(0.5)
            await dim_card.click()
            await asyncio.sleep(0.8)
            await page.screenshot(
                path=str(ARTIFACT_DIR / "04_dimension_flashcard_modal.png"),
                full_page=False
            )
            print("Captured 04_dimension_flashcard_modal.png")
            close_btn = page.locator('button[aria-label="Close modal"]').first
            if await close_btn.count() > 0:
                await close_btn.click()
                await asyncio.sleep(0.5)

        print("5. Opening Share Dialog...")
        share_btn = page.locator('button:has-text("Share")').first
        if await share_btn.count() > 0:
            await share_btn.click()
            await asyncio.sleep(0.8)
            await page.screenshot(
                path=str(ARTIFACT_DIR / "05_share_modal.png"),
                full_page=False
            )
            print("Captured 05_share_modal.png")
            close_btn = page.locator('button[aria-label="Close share dialog"]').first
            if await close_btn.count() > 0:
                await close_btn.click()
                await asyncio.sleep(0.5)

        print("6. Navigating to Contact & FAQs page...")
        await page.goto("http://localhost:5173/contact", wait_until="domcontentloaded")
        await asyncio.sleep(1)
        # Search FAQs
        search_input = page.locator('input[placeholder*="Search FAQs"]').first
        if await search_input.count() > 0:
            await search_input.fill("tax")
            await asyncio.sleep(0.5)
        await page.screenshot(
            path=str(ARTIFACT_DIR / "06_contact_and_faqs.png"),
            full_page=False
        )
        print("Captured 06_contact_and_faqs.png")

        print("7. Submitting Contact Inquiry Form...")
        clear_btn = page.locator('button:has-text("Clear")').first
        if await clear_btn.count() > 0:
            await clear_btn.click()
            await asyncio.sleep(0.3)

        name_in = page.locator('input[placeholder*="Ramesh Kumar"]').first
        email_in = page.locator('input[placeholder="name@business.com"]').first
        msg_in = page.locator('textarea[placeholder*="describe"]').first
        send_btn = page.locator('button:has-text("Send Inquiry")').first

        if await name_in.count() > 0:
            await name_in.fill("Rajesh Kumar")
            await email_in.fill("rajesh@kumarcloth.in")
            await msg_in.fill("Seeking advisory on barcode billing and ONDC marketplace onboarding for our store.")
            await send_btn.click()
            await asyncio.sleep(1.5)
            await page.screenshot(
                path=str(ARTIFACT_DIR / "07_contact_inquiry_ticket.png"),
                full_page=False
            )
            print("Captured 07_contact_inquiry_ticket.png")

        print("8. Navigating to Roadmap page...")
        await page.goto("http://localhost:5173/roadmap", wait_until="domcontentloaded")
        await asyncio.sleep(1.5)
        await page.screenshot(
            path=str(ARTIFACT_DIR / "08_roadmap_view.png"),
            full_page=False
        )
        print("Captured 08_roadmap_view.png")

        await context.close()
        await browser.close()
        print("Walkthrough recording completed successfully!")

        # Copy the generated video to a clean named artifact file
        import shutil
        video_files = list(VIDEO_DIR.glob("*.webm"))
        if video_files:
            latest_video = max(video_files, key=os.path.getctime)
            dest_video = ARTIFACT_DIR / "digimitra_user_walkthrough.webm"
            shutil.copy(str(latest_video), str(dest_video))
            print(f"Copied {latest_video.name} to {dest_video.name} ({dest_video.stat().st_size} bytes)")

if __name__ == "__main__":
    asyncio.run(main())
