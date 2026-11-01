"use client";

import { useState } from "react";
import { getApiConfig, setApiConfig } from "@/lib/api/settings";
import styles from "@/styles/Simulator.module.css";

const DELAYS = [
  { label: "Fast (100–400 ms)", minDelay: 100, maxDelay: 400 },
  { label: "Normal (0.5–3 s)", minDelay: 500, maxDelay: 3000 },
  { label: "Slow (2–6 s)", minDelay: 2000, maxDelay: 6000 },
];

const ERROR_RATES = [0, 0.05, 0.3];

export default function Simulator() {
  const [delayIndex, setDelayIndex] = useState(() =>
    DELAYS.findIndex((d) => d.minDelay === getApiConfig().minDelay),
  );
  const [errorChance, setErrorChance] = useState(
    () => getApiConfig().errorChance,
  );

  return (
    <fieldset className={styles.simulator}>
      <legend className={styles.legend}>Network simulator</legend>
      <label className={styles.field}>
        <span>Latency</span>
        <select
          value={delayIndex}
          onChange={(e) => {
            const index = Number(e.target.value);
            setDelayIndex(index);
            setApiConfig({
              minDelay: DELAYS[index].minDelay,
              maxDelay: DELAYS[index].maxDelay,
            });
          }}
        >
          {DELAYS.map((d, index) => (
            <option key={d.label} value={index}>
              {d.label}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span>Failures</span>
        <select
          value={errorChance}
          onChange={(e) => {
            const chance = Number(e.target.value);
            setErrorChance(chance);
            setApiConfig({ errorChance: chance });
          }}
        >
          {ERROR_RATES.map((rate) => (
            <option key={rate} value={rate}>
              {Math.round(rate * 100)}% of requests
            </option>
          ))}
        </select>
      </label>
    </fieldset>
  );
}
