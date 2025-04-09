
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy: React.FC = () => {
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
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-6">Last updated: April 9, 2025</p>
      </div>

      <div className="space-y-6 text-gray-300">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you create an account, 
            use our services, or communicate with us. This may include your name, email address, 
            and usage data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, 
            to communicate with you, and to personalize your experience. We may also use the 
            data to develop new features and services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Data Security</h2>
          <p>
            We implement measures designed to secure your personal information from accidental 
            loss and from unauthorized access, use, alteration, and disclosure. However, the 
            transmission of information via the internet is not completely secure, and we cannot 
            guarantee the security of your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Retention</h2>
          <p>
            We will retain your personal information only for as long as is necessary for the 
            purposes set out in this Privacy Policy. We will retain and use your information to 
            the extent necessary to comply with our legal obligations, resolve disputes, and 
            enforce our policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
          <p>
            You have the right to access, update, or delete the information we have on you. 
            Whenever made possible, you can access, update, or request deletion of your 
            personal information directly within your account settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any 
            changes by posting the new Privacy Policy on this page and updating the "Last updated" 
            date at the top of this page.
          </p>
        </section>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;
