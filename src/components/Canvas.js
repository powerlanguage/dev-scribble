import React, { useEffect, useRef, useState, useCallback } from "react";
import styled from "@emotion/styled";
import { distractAnimation } from "./styles";

const SmartCanvas = styled.canvas`
  max-width: 100%;
  ${(props) => (props.distraction ? distractAnimation : "")};
`;

function calcDrawPosition(event, canvas) {
  return [
    ((event.pageX - canvas.offsetLeft) * canvas.width) / canvas.offsetWidth,
    ((event.pageY - canvas.offsetTop) * canvas.height) / canvas.offsetHeight,
  ];
}

function Canvas({
  onChange,
  drawOperation,
  oldDrawOperations,
  color,
  disabled,
  nextPlayer,
  redrawTimestamp,
  distraction,
}) {
  const canvasRef = useRef();
  const [previous, setPrevious] = useState(null);
  const [current, setCurrent] = useState(null);
  const [drawing, setDrawing] = useState(false);

  const paint = useCallback((drawOperation) => {
    const ctx = canvasRef.current.getContext("2d");

    ctx.strokeStyle = drawOperation.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(drawOperation.previous[0], drawOperation.previous[1]);
    ctx.lineTo(drawOperation.current[0], drawOperation.current[1]);
    ctx.closePath();
    ctx.stroke();
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    oldDrawOperations.forEach(paint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextPlayer, redrawTimestamp]);

  useEffect(() => {
    if (!drawing || disabled || !previous || !current) {
      return;
    }
    paint({
      previous,
      current,
      color,
    });

    onChange({ previous, current, color });
  }, [onChange, drawing, previous, current, color, disabled, paint]);

  useEffect(() => {
    if (!drawOperation) {
      return;
    }
    paint(drawOperation);
  }, [drawOperation, paint]);

  const handleMouseDown = useCallback((event) => {
    setCurrent(calcDrawPosition(event, canvasRef.current));
    setDrawing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setDrawing(false);
    setCurrent(null);
    setPrevious(null);
  }, []);

  const handleMouseMove = useCallback(
    (event) => {
      setPrevious(current);
      setCurrent(calcDrawPosition(event, canvasRef.current));
    },
    [current]
  );

  const handleTouchStart = useCallback(
    (event) => {
      const touch = event.touches[0];
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      handleMouseDown(mouseEvent);
    },
    [handleMouseDown]
  );

  const handleTouchEnd = useCallback(
    (event) => {
      handleMouseUp();
    },
    [handleMouseUp]
  );

  const handleTouchMove = useCallback(
    (event) => {
      const touch = event.touches[0];
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      handleMouseMove(mouseEvent);
    },
    [handleMouseMove]
  );

  return (
    <SmartCanvas
      ref={canvasRef}
      width="800"
      height="600"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={drawing ? handleMouseMove : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={drawing ? handleTouchMove : undefined}
      distraction={distraction}
    />
  );
}

export default Canvas;
