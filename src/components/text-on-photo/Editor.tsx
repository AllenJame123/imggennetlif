/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import TextStyleControls from "./TextStyleControls";

const saveState = (canvas: any, setUndoStack: React.Dispatch<React.SetStateAction<string[]>>) => {
  if (!canvas) return;
  setUndoStack((prev: string[]) => [...prev, JSON.stringify(canvas)]);
};

const Editor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<any>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fabricCanvas: any = null;
    if (!canvasRef.current) return;
    import('fabric').then(({ fabric }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newCanvas: any = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 500,
        preserveObjectStacking: true
      });
      fabricCanvas = newCanvas;
      setCanvas(newCanvas);
    });
    return () => {
      if (fabricCanvas && typeof fabricCanvas.dispose === 'function') {
        fabricCanvas.dispose();
      }
    };
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !event.target.files?.[0]) return;
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;
      import('fabric').then(({ fabric }) => {
        fabric.Image.fromURL(e.target.result!.toString(), (img: any) => {
          img.set({ selectable: false });
          canvas.clear();
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width! / img.width!,
            scaleY: canvas.height! / img.height!,
          });
          saveState(canvas, setUndoStack);
        });
      });
    };
    reader.readAsDataURL(file);
  };

  const addText = () => {
    if (!canvas) return;
    const text = (document.getElementById('textInput') as HTMLInputElement)?.value;
    const font = (document.getElementById('fontSelect') as HTMLSelectElement)?.value;
    const size = parseInt((document.getElementById('fontSize') as HTMLInputElement)?.value || "20", 10);
    const color = (document.getElementById('fontColor') as HTMLInputElement)?.value;
    import('fabric').then(({ fabric }) => {
      const textBox = new fabric.Textbox(text, {
        left: 100,
        top: 100,
        fontFamily: font,
        fontSize: size,
        fill: color,
        editable: true,
      });
      canvas.add(textBox);
      canvas.setActiveObject(textBox);
      saveState(canvas, setUndoStack);
    });
  };

  const toggleStyle = (style: 'bold' | 'italic' | 'underline') => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject() as any;
    if (!activeObject || activeObject.type !== 'textbox') return;
    switch (style) {
      case 'bold':
        activeObject.set('fontWeight', activeObject.fontWeight === 'bold' ? 'normal' : 'bold');
        break;
      case 'italic':
        activeObject.set('fontStyle', activeObject.fontStyle === 'italic' ? 'normal' : 'italic');
        break;
      case 'underline':
        activeObject.set('underline', !activeObject.underline);
        break;
    }
    canvas.renderAll();
    saveState(canvas, setUndoStack);
  };

  const undo = () => {
    if (!canvas || undoStack.length === 0) return;
    const state = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    canvas.loadFromJSON(state, canvas.renderAll.bind(canvas));
  };

  const downloadImage = () => {
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL({ 
      format: 'png',
      multiplier: 1
    });
    link.click();
  };

  useEffect(() => {
    if (!canvas) return;
    canvas.on('mouse:down', () => saveState(canvas, setUndoStack));
  }, [canvas]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject() as fabric.Textbox;
    if (activeObject && activeObject.type === 'textbox') {
      activeObject.set('fontFamily', event.target.value);
      canvas.renderAll();
      saveState(canvas, setUndoStack);
    }
  };

  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject() as fabric.Textbox;
    if (activeObject && activeObject.type === 'textbox') {
      activeObject.set('fontSize', parseInt(event.target.value || "20", 10));
      canvas.renderAll();
      saveState(canvas, setUndoStack);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-4">
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload}
          className="hidden"
        />
        <Button 
          onClick={triggerFileInput}
          className="w-full primary-gradient"
        >
          Choose an Image
        </Button>
      </div>

      <canvas ref={canvasRef} className="border border-gray-200 rounded-lg max-w-full" />

      <TextStyleControls
        onStyleToggle={toggleStyle}
        onFontChange={handleFontChange}
        onSizeChange={handleSizeChange}
      />

      <div className="flex flex-wrap gap-2 justify-center">
        <Button 
          onClick={addText} 
          className="primary-gradient"
        >
          Add Text
        </Button>
        <Button onClick={undo} className="primary-gradient">Undo</Button>
        <Button onClick={downloadImage} className="primary-gradient">
          Download Image
        </Button>
      </div>
    </div>
  );
};

export default Editor;