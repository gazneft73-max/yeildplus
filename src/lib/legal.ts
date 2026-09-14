export type LegalPage = { title: string; updated: string; sections: { h: string; p: string[] }[] };

const updated = "September 2026";

export const LEGAL_PAGES: Record<string, LegalPage> = {
  terms: {
    title: "Terms of Service",
    updated,
    sections: [
      { h: "1. Agreement", p: ["By creating a PlutoVest account you agree to these terms, our Privacy Policy, AML & KYC Policy and Risk Disclosure. If you do not agree, do not use the platform."] },
      { h: "2. Eligibility", p: ["You must be at least 18 years old and legally able to hold digital assets in your jurisdiction. Business accounts must be opened by an authorised representative."] },
      { h: "3. Accounts and security", p: ["You are responsible for keeping your password confidential and for all activity on your account. Tell us immediately if you suspect unauthorised access. We may suspend accounts that show signs of compromise or abuse."] },
      { h: "4. Investment plans, mining contracts and property packages", p: ["Each product states its term, expected return and payout schedule before purchase. Purchases are final once the term starts. Returns are settled to your wallet balance according to the stated schedule.", "Mining payouts are converted from their USD value into XAUT or XRP at the market price at the time of settlement."] },
      { h: "5. Deposits and withdrawals", p: ["Deposits are credited after network confirmation and review. Withdrawals require completed identity verification and are subject to the fees and minimums displayed in the app. We may delay or decline a withdrawal where required by law or our AML procedures."] },
      { h: "6. Loans and cards", p: ["Loans are offered at our discretion to verified members. Repayment terms are shown before you accept. Cards are provided through partner issuers and are subject to their terms."] },
      { h: "7. Fees", p: ["All fees are shown before you confirm a transaction. We may update fees with notice on the platform."] },
      { h: "8. Prohibited use", p: ["You may not use PlutoVest for money laundering, fraud, sanctions evasion, or any unlawful purpose, nor attempt to interfere with the platform's operation."] },
      { h: "9. Limitation of liability", p: ["To the fullest extent permitted by law, PlutoVest is not liable for indirect or consequential losses, or for losses arising from market movements, network outages or events outside our control."] },
      { h: "10. Changes", p: ["We may update these terms. Material changes will be announced in the app. Continued use after the effective date constitutes acceptance."] },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated,
    sections: [
      { h: "What we collect", p: ["Account details (name, email, phone, country), identity documents you submit for verification, transaction records, and technical data such as IP address and device information."] },
      { h: "Why we collect it", p: ["To operate your account, verify your identity as required by law, prevent fraud, provide support, and improve the platform. We do not sell personal data."] },
      { h: "Where it is stored", p: ["Account data is stored with Google Firebase. Identity documents and payment proofs are stored privately in Cloudflare R2 and are only accessible through short-lived signed links generated for our compliance team."] },
      { h: "Retention", p: ["We keep records for as long as your account is open and for the period required by applicable anti-money-laundering regulations afterwards."] },
      { h: "Your rights", p: ["You may request a copy of your data, ask us to correct it, or ask us to delete it where we are not legally required to keep it. Contact support@plutovest.com."] },
      { h: "Cookies", p: ["We use a single strictly-necessary session cookie to keep you signed in. We do not use advertising cookies."] },
    ],
  },
  aml: {
    title: "AML & KYC Policy",
    updated,
    sections: [
      { h: "Purpose", p: ["PlutoVest is committed to preventing money laundering and terrorist financing. This policy explains the checks we perform."] },
      { h: "Identity verification", p: ["Before the first withdrawal, every member must submit a government-issued identity document, a selfie holding that document, and proof of address details. Submissions are reviewed by a trained compliance officer."] },
      { h: "Monitoring", p: ["We monitor deposits and withdrawals for unusual patterns. We may request additional information about the source of funds and may freeze activity while a review is ongoing."] },
      { h: "Reporting", p: ["Where required by law we report suspicious activity to the relevant authorities and may be prohibited from informing you that a report has been made."] },
    ],
  },
  risk: {
    title: "Risk Disclosure",
    updated,
    sections: [
      { h: "Digital assets are volatile", p: ["The value of cryptocurrencies, including Tether Gold and XRP, can change rapidly. Mining payouts are converted at market price and their fiat value will fluctuate after they are paid."] },
      { h: "Returns are not guaranteed", p: ["Expected returns shown on plans are targets based on our operations and are not a promise. Past performance does not predict future results. Only invest amounts you can afford to hold for the full term."] },
      { h: "Real estate", p: ["Property packages depend on rental income and property values, both of which can fall. Holding periods are fixed; early exit is not available."] },
      { h: "Loans", p: ["Borrowing amplifies both gains and losses. Make sure you can meet the repayment schedule before accepting a loan."] },
      { h: "No advice", p: ["Nothing on this platform is financial, tax or legal advice. Consider seeking independent advice before investing."] },
    ],
  },
};
