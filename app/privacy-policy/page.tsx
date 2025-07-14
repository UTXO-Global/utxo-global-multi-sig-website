export default function PrivacyPolicyPage() {
  return (
    <main className="bg-grey-300 min-h-[calc(100vh-69.71px-61px)]">
      <div className="bg-grey-300 pt-[48px] pb-[112px]">
        <div className="max-w-[1024px] mx-auto">
          <h1 className="text-3xl font-bold mb-4">🔐 Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-6">
            Last Updated: July 13, 2025
          </p>

          <section className="mb-8">
            <p>
              At <strong>Safe by UTXO Global</strong>, we value your privacy.
              This page explains what we collect and how we handle your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              1. Information We Collect
            </h2>
            <p>
              We do <strong>not</strong> collect or store:
            </p>
            <ul className="list-disc list-inside mt-2">
              <li>Private keys or seed phrases</li>
              <li>Personally identifiable information (PII)</li>
              <li>User balances or full transaction history</li>
            </ul>
            <p className="mt-2">
              We may use anonymous cookies or analytics for performance and user
              experience improvements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              2. Third-Party Sharing
            </h2>
            <p>
              We do <strong>not</strong> sell or share your data with third
              parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">3. Security</h2>
            <p>
              We use HTTPS and industry best practices to protect communications
              between your browser and our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Your Rights</h2>
            <p>
              You may use this service without providing personal info. Session
              data is stored in your browser and can be cleared anytime.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
