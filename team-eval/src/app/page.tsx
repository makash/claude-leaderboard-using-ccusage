import Link from "next/link";
import {
  Brain,
  Code2,
  ClipboardCheck,
  ArrowRight,
  Users,
  BarChart3,
  Upload,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Claude Analytics",
    description:
      "Track token usage, costs, cache rates, and model usage across your entire team. Get granular insights into how your organization leverages Claude.",
  },
  {
    icon: Code2,
    title: "Codex Tracking",
    description:
      "Monitor task completion, success rates, and efficiency metrics. Understand how your team uses Codex to ship faster.",
  },
  {
    icon: ClipboardCheck,
    title: "Team Evaluations",
    description:
      "Score and review team members on AI proficiency with structured evaluations. Drive continuous improvement with actionable feedback.",
  },
];

const steps = [
  {
    icon: Users,
    step: 1,
    title: "Set up your org",
    description: "Create your organization and configure your evaluation criteria.",
  },
  {
    icon: Star,
    step: 2,
    title: "Invite team members",
    description: "Add your team and assign roles for reviewers and contributors.",
  },
  {
    icon: Upload,
    step: 3,
    title: "Upload usage data",
    description: "Import Claude and Codex usage data via CSV or API integration.",
  },
  {
    icon: BarChart3,
    step: 4,
    title: "Review & evaluate",
    description: "Analyze metrics, run evaluations, and share reports with your team.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-gray-950 to-purple-950/40" />
        <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-32 text-center sm:pt-40">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Track &amp; Evaluate
            </span>{" "}
            Your Team&rsquo;s AI&nbsp;Usage
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 sm:text-xl">
            The all-in-one platform for monitoring Claude and Codex usage,
            measuring productivity, and running structured team evaluations.
          </p>
          <div className="mt-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-800 bg-gray-900/60 p-8 transition hover:border-indigo-700/50 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div className="mb-4 inline-flex rounded-lg bg-indigo-600/10 p-3">
                <feature.icon className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-100">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 bg-gray-900/40">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Built for teams that use AI{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              seriously
            </span>
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: "100K+", label: "API calls tracked" },
              { value: "500+", label: "Teams onboarded" },
              { value: "98%", label: "Uptime" },
              { value: "4.9/5", label: "Avg rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-extrabold text-indigo-400">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h2 className="mb-12 text-center text-2xl font-bold sm:text-3xl">
          How It Works
        </h2>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20">
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Step {item.step}
              </span>
              <h3 className="mt-1 text-lg font-bold text-gray-100">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-gray-800">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} AIRank. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
