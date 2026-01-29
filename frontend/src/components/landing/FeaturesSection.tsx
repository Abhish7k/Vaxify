import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
    },
  },
};

export function Features() {
  const [selectedDate, setSelectedDate] = useState(18);

  return (
    <section className="relative px-5 sm:px-10 py-16 md:py-32 bg-white overflow-hidden transition-all">
      <div className="mx-auto max-w-5xl px-6 w-full">
        {/* header */}
        <AnimatedGroup preset="blur-slide" className="text-center mb-16">
          <p className="text-[#6366f1] text-[11px] font-mono font-bold mb-1 uppercase tracking-[0.2em]">
            Key Features
          </p>
          <h2 className="text-2xl md:text-4xl font-medium tracking-tight text-slate-900 mb-1">
            Everything you need to <br className="hidden md:block" /> manage
            vaccinations efficiently.
          </h2>
        </AnimatedGroup>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto grid gap-2 grid-cols-1 sm:grid-cols-5"
        >
          {/* card 1 - staff dashboard */}
          <motion.div variants={itemVariants} className="sm:col-span-3">
            <Card className="group h-full overflow-hidden shadow-sm border-slate-200 sm:rounded-none sm:rounded-tl-2xl">
              <CardHeader>
                <div className="md:p-4">
                  <p className="font-semibold text-lg text-slate-900">
                    Comprehensive Staff Dashboard
                  </p>
                  <p className="text-slate-500 mt-2 max-w-sm text-sm">
                    Manage inventory, schedule appointments, and record
                    vaccinations from a single, intuitive interface designed for
                    hospital staff.
                  </p>
                </div>
              </CardHeader>

              <div className="relative h-64 pl-6 md:pl-12 overflow-hidden group-hover:-translate-y-1 transition-all duration-500">
                <div className="absolute -inset-6 [background:radial-gradient(75%_95%_at_50%_0%,transparent,rgba(255,255,255,0))_100%]"></div>
                <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-white via-white/40 to-transparent z-10 pointer-events-none"></div>

                <div className="bg-slate-50 h-full w-full rounded-tl-lg border-l border-t border-slate-200 overflow-hidden shadow-sm relative ">
                  <img
                    src="/hero-dash.png"
                    alt="Staff Dashboard Preview"
                    className="absolute inset-0 w-full h-full object-cover object-top-left transition-transform duration-500"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* card 2 - low stock alerts */}
          <motion.div variants={itemVariants} className="sm:col-span-2">
            <Card className="group h-full overflow-hidden shadow-sm border-slate-200 sm:rounded-none sm:rounded-tr-2xl bg-white">
              <div className="p-6 flex flex-col h-full">
                <p className="text-lg font-semibold text-slate-900 mb-2">
                  Smart Inventory Alerts
                </p>
                <p className="text-slate-500 text-sm mb-6">
                  Receive instant notifications when vaccine stock levels fall
                  below critical thresholds.
                </p>
                <CardContent className="mt-auto px-0 py-0 overflow-hidden">
                  <FeaturedMessageCard />
                </CardContent>
              </div>
            </Card>
          </motion.div>

          {/* card 3 - admin approval */}
          <motion.div variants={itemVariants} className="sm:col-span-2">
            <Card className="group h-full p-0 shadow-sm border-slate-200 sm:rounded-none sm:rounded-bl-2xl bg-white overflow-hidden flex flex-col min-h-[300px] sm:min-h-0">
              <div className="p-6 pb-2">
                <p className="text-lg font-semibold text-slate-900">
                  Admin Approval
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Verify hospital credentials with a single click.
                </p>
              </div>

              <div className="p-6 pt-10 relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-5 h-20 bg-linear-to-t from-white via-white/40 to-transparent z-10 pointer-events-none"></div>

                <div className="space-y-3">
                  {[
                    "General Hospital",
                    "City Care Center",
                    "Apollo Hospital",
                    "Community Care Hospital",
                  ].map((label, i) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2.5 shadow-xs hover:bg-slate-50 transition-all duration-500 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center ${i === 0 ? "bg-emerald-50" : "bg-slate-100"}`}
                        >
                          {i === 0 ? (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-900">
                            {label}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${i === 0 ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                      >
                        {i === 0 ? "Approved" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* card 4 - smart appointment booking */}
          <motion.div variants={itemVariants} className="sm:col-span-3">
            <Card className="group h-full relative shadow-sm border-slate-200 sm:rounded-none sm:rounded-br-2xl overflow-hidden flex flex-col">
              <CardHeader className="p-6 md:p-8 z-10 relative">
                <p className="font-semibold text-lg text-slate-900">
                  Smart Appointment Booking
                </p>
                <p className="text-slate-500 mt-2 max-w-sm text-sm">
                  Intelligent slot management that prevents overbooking and
                  optimizes hospital capacity.
                </p>
              </CardHeader>

              <div className="relative h-64 pl-6 md:pl-32 overflow-hidden mt-auto">
                <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-white via-white/40 to-transparent z-10 pointer-events-none"></div>

                <div className="bg-white h-full w-full rounded-tl-lg border-l border-t border-slate-200 overflow-hidden shadow-sm relative p-5 flex flex-col">
                  {/* mock calendar component */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-indigo-600" />
                      <span className="text-[11px] font-bold text-slate-700">
                        January 2026
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                      <span
                        key={`header-${i}`}
                        className="text-[9px] text-slate-400 font-bold w-6 h-6 flex items-center justify-center"
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 14 }).map((_, i) => {
                      const date = 10 + i;
                      const isSelected = selectedDate === date;
                      return (
                        <div
                          key={`date-${i}`}
                          onClick={() => setSelectedDate(date)}
                          className={cn(
                            "h-6 w-6 flex items-center justify-center rounded-md text-[10px] cursor-pointer transition-all duration-200",
                            isSelected
                              ? "bg-indigo-600 text-white shadow-md font-bold scale-110"
                              : "text-slate-600 hover:bg-slate-100",
                          )}
                        >
                          {date}
                        </div>
                      );
                    })}
                  </div>

                  {/* time slots mockup */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all duration-300 cursor-pointer">
                      <span className="text-[10px] text-slate-600 font-medium">
                        09:00 AM
                      </span>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Available
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-all duration-300 cursor-pointer">
                      <span className="text-[10px] text-indigo-900 font-bold">
                        10:30 AM
                      </span>
                      <div className="h-4 w-4 rounded-full bg-indigo-600 flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// message card component
interface Message {
  title: string;
  time: string;
  content: string;
  color: string;
}

const FeaturedMessageCard = () => {
  return (
    <div className="w-full h-[240px] bg-slate-50/50 p-2 overflow-hidden font-sans relative rounded-xl border border-b-0 rounded-b-none border-slate-100">
      {/* fade shadow overlay */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-white via-white/40 to-transparent z-10 pointer-events-none"></div>

      <div className="space-y-2 relative z-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 items-start p-3 border border-slate-200 bg-white rounded-lg shadow-sm transform transition duration-300 ease-in-out cursor-pointer animate-scaleUp hover:translate-y-[-2px] hover:shadow-md`}
          >
            <div
              className={`w-8 h-8 min-w-8 min-h-8 rounded-lg bg-linear-to-br ${msg.color}`}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                {msg.title}
                <span className="text-[10px] text-slate-400">{msg.time}</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-1">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const messages: Message[] = [
  {
    title: "Low Vaccine Stock",
    time: "2m ago",
    content: "Covishield stock below threshold ( < 20 % )",
    color: "from-amber-400 to-orange-500",
  },
  {
    title: "Appointment Update",
    time: "10m ago",
    content: "5 new vaccination appointments booked today.",
    color: "from-blue-400 to-indigo-500",
  },
  {
    title: "Critical Alert",
    time: "1h ago",
    content: "Rotavirus vaccine stock critically low.",
    color: "from-red-400 to-pink-500",
  },
  {
    title: "Vaccine Restocked",
    time: "3h ago",
    content: "Polio vaccine successfully restocked (1000 doses).",
    color: "from-emerald-400 to-teal-500",
  },
];
