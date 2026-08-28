import "./Stepper.css";

function Stepper({ steps, currentStepIndex }) {
  return (
    <ol className="stepper" aria-label="Bilet alma adımları">
      {steps.map((label, index) => {
        const state =
          index < currentStepIndex
            ? "complete"
            : index === currentStepIndex
              ? "current"
              : "upcoming";

        return (
          <li
            key={label}
            className={`stepper-step stepper-step--${state}`}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className="stepper-number" aria-hidden="true">
              {state === "complete" ? "✓" : index + 1}
            </span>
            <span className="stepper-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default Stepper;
