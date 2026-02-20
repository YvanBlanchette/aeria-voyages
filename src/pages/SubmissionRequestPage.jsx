import WizardLayout from "@/components/sections/submission-request/WizardLayout";
import StepIndicator from "@/components/sections/submission-request/steps/StepIndicator";
import WizardNav from "@/components/sections/submission-request/WizardNav";
import SuccessScreen from "@/components/sections/submission-request/SuccessScreen";

import StepYou from "@/components/sections/submission-request/steps/StepYou";
import StepTrip from "@/components/sections/submission-request/steps/StepTrip";
import StepDetails from "@/components/sections/submission-request/steps/StepDetails";
import StepDreams from "@/components/sections/submission-request/steps/StepDreams";

import useSubmissionForm from "@/hooks/use-submission-form";

export default function SubmissionRequestPage() {
	const ctx = useSubmissionForm();

	if (ctx.status === "success") {
		return <SuccessScreen prenom={ctx.form.prenom} />;
	}

	return (
		<WizardLayout>
			<StepIndicator step={ctx.step} />

			<div className="bg-white/70 backdrop-blur-xl border border-[rgba(184,147,92,0.2)] rounded-sm p-6 sm:px-10 sm:py-8 shadow-[0_20px_60px_rgba(61,46,30,0.08),0_4px_16px_rgba(184,147,92,0.1)]">
				{ctx.step === 1 && <StepYou {...ctx} />}
				{ctx.step === 2 && <StepTrip {...ctx} />}
				{ctx.step === 3 && <StepDetails {...ctx} />}
				{ctx.step === 4 && <StepDreams {...ctx} />}

				<WizardNav
					step={ctx.step}
					status={ctx.status}
					onPrev={ctx.prev}
					onNext={ctx.next}
					onSubmit={ctx.submit}
					showError={ctx.status === "error"}
				/>
			</div>
		</WizardLayout>
	);
}
