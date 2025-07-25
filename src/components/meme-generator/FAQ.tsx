import { Card } from "@/components/ui/card";

const FAQ = () => {
  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-bold text-center mb-8">Free Meme Generator FAQ</h2>
      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-2">
            How does this online meme creator work?
          </h3>
          <p className="text-muted-foreground">
            Our AI meme generator free online tool lets you describe the image you want, add your top and bottom text, and click generate. The AI creates custom memes based on your inputs instantly.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-2">
            Can I customize text placement with the viral meme maker?
          </h3>
          <p className="text-muted-foreground">
            Yes, you can add text to both the top and bottom of your meme. The text automatically adjusts to fit within the image for optimal readability.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-2">
            What image formats are supported for download?
          </h3>
          <p className="text-muted-foreground">
            Generated memes can be downloaded as PNG files, which maintain high quality and are widely supported across platforms.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-2">
            Is there a limit to how many memes I can create?
          </h3>
          <p className="text-muted-foreground">
            No, you can create unlimited memes! Our service is completely free and doesn't require any registration.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-2">
            Can I use the memes commercially?
          </h3>
          <p className="text-muted-foreground">
            Yes, all generated memes are free to use for both personal and commercial purposes. You own the rights to your created memes.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;