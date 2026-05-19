import React from "react";

type Props = {
  value?: number; // 0-100
  label?: string;
  color?: string;
  ariaLabel?: string;
};

export default function ProficiencyBar({
  value = 60,
  label,
  color = "var(--color-primary)",
  ariaLabel,
}: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        {label ? (
          <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{label}</div>
        ) : null}
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--color-muted)",
            fontWeight: 700,
          }}
        >
          {pct}%
        </div>
      </div>
      <div
        role="progressbar"
        aria-label={ariaLabel || label || "Proficiency"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        style={{
          width: "100%",
          height: 10,
          background: "var(--color-border)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 999,
            transition: "width 300ms ease",
          }}
        />
      </div>
    </div>
  );
}
