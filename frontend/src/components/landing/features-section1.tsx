"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Database, BellRing, ShieldCheck, BarChart3, FileCheck2 } from "lucide-react";

export function Features1() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 space-y-16">
        
        {/* ================= HEADER SECTION (Integrated) ================= */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Discover features built for modern vaccination management
          </h2>
          <p className="mt-4 text-sm text-muted-foreground md:text-base">
            Simple, secure, and intelligent tools designed to streamline
            vaccination tracking and compliance.
          </p>
        </div>

        {/* ================= GRID SECTION ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 100% Configurable */}
          <Card>
            <CardContent className="p-10 text-center space-y-6">
              <div className="relative mx-auto h-28 w-48 flex items-center justify-center">
                <motion.svg
                  viewBox="0 0 200 80"
                  className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2"
                  aria-hidden
                >
                  <motion.ellipse
                    cx="100"
                    cy="40"
                    rx="78"
                    ry="26"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                    strokeDasharray="6 10"
                    animate={{ strokeDashoffset: [0, -40] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  />
                </motion.svg>
                <span className="relative z-10 text-5xl font-semibold tracking-tight">
                  100%
                </span>
              </div>
              <h3 className="text-xl tracking-tight font-medium">Configurable</h3>
              <p className="text-sm text-muted-foreground">
                Vaccines, slots, working hours, and hospital rules are fully configurable.
              </p>
            </CardContent>
          </Card>

          {/* Secure by design */}
          <Card>
            <CardContent className="p-10 text-center space-y-6">
              <div className="relative mx-auto w-24 h-24">
                <motion.svg viewBox="0 0 100 100" className="absolute inset-0">
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="260"
                    strokeDashoffset="260"
                    animate={{ strokeDashoffset: 0 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                  />
                </motion.svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <h3 className="text-xl tracking-tight font-medium">Secure by design</h3>
              <p className="text-sm text-muted-foreground">
                Role-based access ensures users, staff, and admins see only what they should.
              </p>
            </CardContent>
          </Card>

          {/* Real-time updates */}
          <Card>
            <CardContent className="p-10 text-center space-y-6">
              <div className="relative h-20 w-full">
                <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200" />
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{ left: `${i * 25}%` }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm" />
                  </motion.div>
                ))}
                <motion.div
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-medium text-indigo-600"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  LIVE
                </motion.div>
              </div>
              <h3 className="text-xl tracking-tight font-medium">Real-time updates</h3>
              <p className="text-sm text-muted-foreground">
                Appointment status and vaccination records sync instantly across the platform.
              </p>
            </CardContent>
          </Card>

          {/* Admin control (Wide Card) */}
          <Card className="md:col-span-2">
            <CardContent className="p-10 space-y-6">
              <h3 className="text-xl tracking-tight font-medium">Admin control</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Verify hospitals, approve actions, and monitor platform activity in real time.
              </p>
              <div className="relative mt-6 space-y-3">
                {[
                  { label: "Pending verification", active: true },
                  { label: "Under review", active: false },
                  { label: "Approved", active: false },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    className="flex items-center justify-between rounded-md border px-4 py-3 bg-background"
                    animate={
                      item.active
                        ? {
                            backgroundColor: [
                              "rgba(255,255,255,1)",
                              "rgba(99,102,241,0.04)",
                              "rgba(255,255,255,1)",
                            ],
                          }
                        : {}
                    }
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 1.2,
                      ease: "easeInOut",
                    }}
                  >
                    <span className="text-sm text-foreground">{item.label}</span>
                    <motion.span
                      className="text-xs text-muted-foreground"
                      animate={item.active ? { opacity: [0.5, 1, 0.5] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {item.active ? "In progress" : "Idle"}
                    </motion.span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Built for everyone */}
          <Card>
            <CardContent className="p-10 space-y-6">
              <h3 className="text-xl tracking-tight font-medium">Built for everyone</h3>
              <p className="text-sm text-muted-foreground">
                One platform designed to serve every role seamlessly.
              </p>
              <div className="relative mx-auto h-32 w-32">
                <motion.div
                  className="absolute inset-0 rounded-full border"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />
                {["Citizen", "Staff", "Admin"].map((role, i) => (
                  <motion.div
                    key={role}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `rotate(${i * 120}deg) translateX(64px)`,
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center text-[10px] font-bold">
                      {role[0]}
                    </div>
                  </motion.div>
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
}