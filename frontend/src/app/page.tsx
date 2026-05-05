'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Zap, Shield, Users, BarChart3, Kanban, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Kanban, title: 'Kanban Boards', desc: 'Drag-and-drop task management with real-time updates across your team.' },
  { icon: Users, title: 'Team Collaboration', desc: 'Invite members, assign roles, and track contributions effortlessly.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Deep insights into productivity, task trends, and team performance.' },
  { icon: Bell, title: 'Smart Notifications', desc: 'Real-time alerts for deadlines, assignments, and team activity.' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Fine-grained permissions to keep your projects secure and organized.' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Built with Next.js and optimized APIs for instant responsiveness.' },
];

const stats = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<100ms', label: 'API Response' },
  { value: 'SOC 2', label: 'Compliant' },
  { value: '256-bit', label: 'Encryption' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Kanban className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">TaskFlow</span>
          </div>
          <nav className="hidden gap-6 md:flex">
            {['Features', 'Pricing', 'Docs'].map((item) => (
              <a key={item} href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
          <div className="absolute left-1/2 top-20 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Zap className="h-3.5 w-3.5" />
            <span>Built for modern teams</span>
          </div>

          <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Ship projects
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              faster together
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
            TaskFlow combines kanban boards, real-time collaboration, and powerful analytics 
            to help your team move faster and build better.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link href="/register">
                Start for free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
              <Link href="/login">
                View demo
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            {['No credit card required', 'Free for small teams', 'Deploy in minutes'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        {/* App Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 mt-20 w-full max-w-5xl"
        >
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/5">
            <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/30 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <div className="ml-4 flex-1 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
                app.taskflow.com/dashboard
              </div>
            </div>
            {/* Mock dashboard */}
            <div className="grid grid-cols-3 gap-4 p-6">
              {[
                { label: 'Active Projects', value: '12', color: 'text-blue-500' },
                { label: 'Tasks Completed', value: '247', color: 'text-green-500' },
                { label: 'Team Members', value: '18', color: 'text-purple-500' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3 px-6 pb-6">
              {['Todo', 'In Progress', 'Review', 'Done'].map((col, i) => (
                <div key={col} className="rounded-xl bg-muted/40 p-3">
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">{col}</p>
                  {Array.from({ length: i === 3 ? 1 : 2 }).map((_, j) => (
                    <div key={j} className="mb-2 rounded-lg border border-border bg-card p-2.5 shadow-sm">
                      <div className="h-2 w-3/4 rounded bg-muted animate-pulse" />
                      <div className="mt-2 h-2 w-1/2 rounded bg-muted animate-pulse" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-muted/20 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold md:text-5xl">Everything your team needs</h2>
            <p className="mt-4 text-muted-foreground">
              All the tools to plan, track, and ship great work.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-purple-700 p-12 text-center text-white shadow-2xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <h2 className="relative text-3xl font-bold md:text-4xl">
              Ready to transform how your team works?
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-white/80">
              Join thousands of teams shipping faster with TaskFlow.
            </p>
            <div className="relative mt-8 flex justify-center gap-4">
              <Button size="lg" variant="secondary" asChild className="h-12 px-8">
                <Link href="/register">Get started free</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8">
        <div className="container mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Kanban className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold">TaskFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 TaskFlow. Built with ❤️ for productive teams.
          </p>
        </div>
      </footer>
    </div>
  );
}
