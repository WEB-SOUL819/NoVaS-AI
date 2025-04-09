
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfService: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ChevronLeft size={16} />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-400 mb-6">Last updated: April 9, 2025</p>
      </div>

      <div className="space-y-6 text-gray-300">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
          <p>
            Permission is granted to use our services for personal, non-commercial use only. This license shall automatically terminate if you violate any of these restrictions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Disclaimer</h2>
          <p>
            Our services are provided "as is". We make no warranties, expressed or implied, and hereby disclaim all warranties, including without limitation implied warranties of merchantability.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Limitations</h2>
          <p>
            In no event shall we be liable for any damages arising out of the use or inability to use our services, even if we have been notified of the possibility of such damages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Revisions and Errata</h2>
          <p>
            The materials appearing on our service may include technical, typographical, or photographic errors. We do not warrant that any of the materials are accurate, complete, or current.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Links</h2>
          <p>
            We have not reviewed all of the sites linked to our service and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Modifications</h2>
          <p>
            We may revise these terms of service at any time without notice. By using our service you are agreeing to be bound by the then current version of these Terms of Service.
          </p>
        </section>
      </div>
    </motion.div>
  );
};

export default TermsOfService;
