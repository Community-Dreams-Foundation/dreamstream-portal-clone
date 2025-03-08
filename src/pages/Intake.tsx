
import { IntakeForm } from "@/components/IntakeForm";

const Intake = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Join DreamStream</h1>
            <p className="text-muted-foreground mt-2">
              Step 1 of 4: Tell us about yourself
            </p>
          </div>
          
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: "25%" }}
            />
          </div>

          <IntakeForm />
        </div>
      </div>
    </div>
  );
};

export default Intake;
