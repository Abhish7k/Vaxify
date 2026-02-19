import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { motion, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const RegisterPage = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className=""
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-center gap-2 mb-5"
      >
        <img src="/logo.svg" alt="VMS Logo" className="w-12 h-12 mb-0.5" />
      </motion.div>

      <motion.h2
        variants={itemVariants}
        className="text-xl font-semibold text-center text-slate-800 mb-2"
      >
        Create an Account
      </motion.h2>

      <motion.p
        variants={itemVariants}
        className="text-center text-slate-500 mb-8 text-sm"
      >
        Choose how you want to register
      </motion.p>

      <motion.div variants={itemVariants} className="grid gap-6">
        {/* register as user  */}
        <Link to="/register/user">
          <Card className="cursor-pointer hover:shadow-md transition-all duration-300 group">
            <CardHeader className="flex flex-row gap-4 items-center">
              <img
                src="https://ik.imagekit.io/vaxify/icons/profile.png"
                alt=""
                className="w-15 h-15 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300"
              />

              <div className="space-y-1">
                <CardTitle>Register as User</CardTitle>

                <CardDescription>
                  For citizens booking vaccination appointments
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        {/* register as hospital staff */}
        <Link to="/register/staff">
          <Card className="cursor-pointer hover:shadow-md transition-all duration-300 group">
            <CardHeader className="flex flex-row gap-4 items-center">
              <img
                src="https://ik.imagekit.io/vaxify/icons/staff.png"
                alt=""
                className="w-15 h-15 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300"
              />

              <div className="space-y-1">
                <CardTitle>Register as Hospital Staff</CardTitle>

                <CardDescription>
                  For hospital staff managing vaccination centers
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default RegisterPage;
