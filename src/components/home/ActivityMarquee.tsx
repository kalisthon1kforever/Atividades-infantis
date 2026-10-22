import type { CSSProperties } from "react";
import { HOME_MODULES, homeActivities, type HomeActivity, type HomeModule } from "@/data/home";

function toneStyle(module: HomeModule): CSSProperties {
  return { "--tone": module.tone, "--soft": module.soft } as CSSProperties;
}

function ModuleCard({ module }: { module: HomeModule }) {
  return (
    <article className="hm-act hm-act-module" style={toneStyle(module)}>
      <span className="hm-act-module-num">Módulo {module.number}</span>
      <span className="hm-act-module-icon" aria-hidden="true">
        {module.icon}
      </span>
      <h3>{module.title}</h3>
      <p>{module.description}</p>
    </article>
  );
}

function ActivityCard({ activity }: { activity: HomeActivity }) {
  return (
    <article className="hm-act" style={toneStyle(activity.module)}>
      <div className="hm-act-sheet" aria-hidden="true">
        <div className="hm-act-sheet-head">
          <span />
          <span />
        </div>
        <div className="hm-act-glyphs">
          {activity.glyphs.map((glyph, index) => (
            <span key={`${glyph}-${index}`}>{glyph}</span>
          ))}
        </div>
        <div className="hm-act-sheet-lines">
          <span />
          <span />
        </div>
      </div>
      <span className="hm-act-chip">
        {activity.module.icon} {activity.module.title}
      </span>
      <h3>{activity.title}</h3>
      <p>{activity.summary}</p>
      <div className="hm-act-meta">
        <span>⏱️ {activity.minutes} min</span>
        <span>👧 {activity.ages}</span>
      </div>
    </article>
  );
}

function Row({ modules, reverse }: { modules: HomeModule[]; reverse?: boolean }) {
  const activities = homeActivities();
  const cards = modules.flatMap((module) => {
    const own = activities.filter((activity) => activity.module.key === module.key);
    return [
      <ModuleCard key={`m-${module.key}`} module={module} />,
      ...own.map((activity) => <ActivityCard key={activity.id} activity={activity} />),
    ];
  });

  return (
    <div className="hm-marquee">
      <div className={reverse ? "hm-marquee-track hm-marquee-rev" : "hm-marquee-track"}>
        <div className="hm-marquee-group">{cards}</div>
        <div className="hm-marquee-group" aria-hidden="true">
          {cards}
        </div>
      </div>
    </div>
  );
}

export function ActivityMarquee() {
  return (
    <div className="hm-marquees">
      <Row modules={HOME_MODULES.slice(0, 3)} />
      <Row modules={HOME_MODULES.slice(3)} reverse />
    </div>
  );
}
