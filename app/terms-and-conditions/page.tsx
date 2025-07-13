export default function TermAndConditionsPage() {
  return (
    <main className="bg-grey-300 min-h-[calc(100vh-69.71px-61px)]">
      <div className="bg-grey-300 pt-[48px] pb-[112px]">
        <div className="max-w-[1024px] mx-auto">
          <h1 className="text-3xl font-bold mb-4">📜 Terms and Conditions</h1>
          <p className="text-sm text-gray-500 mb-6">
            Last Updated: July 13, 2025
          </p>

          <section className="mb-8">
            <p>
              Welcome to <strong>Safe by UTXO Global</strong> (
              <a
                href="http://safe.utxo.global"
                className="text-blue-600 underline"
              >
                http://safe.utxo.global
              </a>
              ). By using this website, you agree to the following terms:
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              1. Service Description
            </h2>
            <p>
              Safe is a web-based app to create and manage multisig wallets on
              Nervos CKB. Users can:
            </p>
            <ul className="list-disc list-inside mt-2">
              <li>Generate multisig addresses</li>
              <li>Propose, sign, and submit transactions</li>
              <li>Coordinate approvals among multiple signers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              2. No Custody of Private Keys
            </h2>
            <p>
              We do <strong>not</strong> store any private keys, mnemonics, or
              sensitive data. All signing happens locally in your browser.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              3. User Responsibility
            </h2>
            <p>
              You are responsible for the security of your keys and actions.
              Safe is a non-custodial tool; we are <strong>not liable</strong>{" "}
              for any loss due to misuse, bugs, or key loss.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              4. Disclaimer of Warranties
            </h2>
            <p>
              Safe is provided 'as is' without warranties. We do not guarantee
              uptime or error-free service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Modifications</h2>
            <p>
              We may change these terms at any time. Continued use implies
              acceptance of the updated terms.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
