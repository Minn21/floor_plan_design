import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';

const FloorCanvas = () => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [mode, setMode] = useState('column');
  const [materialProps, setMaterialProps] = useState({
    concreteGrade: 'C25',
    steelGrade: 'Fe415',
    columnSize: 450,
    beamWidth: 300,
    beamDepth: 450
  });
  
  // Wall properties
  const [wallProps, setWallProps] = useState({
    thickness: 200,
    height: 2400
  });
  
  // For wall, door and window drawing
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  
  // Grid settings
  const [gridSettings, setGridSettings] = useState({
    showGrid: true,
    gridSize: 50,
    snapToGrid: true
  });
  
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth - 400,
    height: window.innerHeight - 50
  });

  const stageRef = useRef();
  const layerRef = useRef();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth - 400,
        height: window.innerHeight - 50
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Snap position to grid
  const snapToGrid = (position) => {
    if (!gridSettings.snapToGrid) return position;
    
    return {
      x: Math.round(position.x / gridSettings.gridSize) * gridSettings.gridSize,
      y: Math.round(position.y / gridSettings.gridSize) * gridSettings.gridSize
    };
  };
  
  const handleAddColumn = (position) => {
    const snappedPos = snapToGrid(position);
    
    const newColumn = {
      id: uuidv4(),
      type: 'column',
      name: `COL-${elements.filter(e => e.type === 'column').length + 1}`,
      x: snappedPos.x,
      y: snappedPos.y,
      width: materialProps.columnSize,
      height: materialProps.columnSize,
      material: { ...materialProps }
    };
    setElements([...elements, newColumn]);
  };

  const handleAddBeam = (startPos) => {
    const snappedPos = snapToGrid(startPos);
    
    const newBeam = {
      id: uuidv4(),
      type: 'beam',
      name: `BEA-${elements.filter(e => e.type === 'beam').length + 1}`,
      points: [snappedPos.x, snappedPos.y, snappedPos.x, snappedPos.y],
      width: materialProps.beamWidth,
      depth: materialProps.beamDepth,
      material: { ...materialProps }
    };
    setElements([...elements, newBeam]);
  };
  
  // Start drawing a wall
  const handleStartDrawingWall = (position) => {
    const snappedPos = snapToGrid(position);
    setIsDrawing(true);
    setStartPoint(snappedPos);
    
    // Create a temporary wall
    const newWall = {
      id: uuidv4(),
      type: 'wall',
      name: `WALL-${elements.filter(e => e.type === 'wall').length + 1}`,
      points: [snappedPos.x, snappedPos.y, snappedPos.x, snappedPos.y],
      thickness: wallProps.thickness,
      height: wallProps.height
    };
    setElements([...elements, newWall]);
  };
  
  // Update wall while drawing
  const handleDrawWall = (position) => {
    if (!isDrawing || !startPoint) return;
    
    const snappedPos = snapToGrid(position);
    const lastWallIndex = elements.findIndex(e => e.type === 'wall');
    if (lastWallIndex === -1) return;
    
    const updatedElements = [...elements];
    updatedElements[lastWallIndex] = {
      ...updatedElements[lastWallIndex],
      points: [startPoint.x, startPoint.y, snappedPos.x, snappedPos.y]
    };
    
    setElements(updatedElements);
  };
  
  // Finish drawing a wall
  const handleFinishDrawingWall = () => {
    setIsDrawing(false);
    setStartPoint(null);
  };
  
  // Add a door to a wall
  const handleAddDoor = (position) => {
    const snappedPos = snapToGrid(position);
    
    // Find the closest wall to place the door on
    const walls = elements.filter(e => e.type === 'wall');
    if (walls.length === 0) return;
    
    let closestWall = null;
    let minDistance = Infinity;
    let doorPosition = { x: 0, y: 0 };
    
    walls.forEach(wall => {
      const [x1, y1, x2, y2] = wall.points;
      
      // Calculate the projection of the point onto the wall line
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      if (length === 0) return;
      
      const t = ((snappedPos.x - x1) * (x2 - x1) + (snappedPos.y - y1) * (y2 - y1)) / (length * length);
      
      // Check if projection is on the wall segment
      if (t < 0 || t > 1) return;
      
      const projX = x1 + t * (x2 - x1);
      const projY = y1 + t * (y2 - y1);
      
      const distance = Math.sqrt(Math.pow(snappedPos.x - projX, 2) + Math.pow(snappedPos.y - projY, 2));
      
      if (distance < minDistance) {
        minDistance = distance;
        closestWall = wall;
        doorPosition = { x: projX, y: projY };
      }
    });
    
    // Only add door if it's close enough to a wall (within 50px)
    if (closestWall && minDistance <= 50) {
      const [x1, y1, x2, y2] = closestWall.points;
      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      
      const newDoor = {
        id: uuidv4(),
        type: 'door',
        name: `DOOR-${elements.filter(e => e.type === 'door').length + 1}`,
        x: doorPosition.x,
        y: doorPosition.y,
        width: 900,  // Default door width
        height: 2100, // Default door height
        wallId: closestWall.id,
        angle: angle,
        thickness: closestWall.thickness
      };
      
      setElements([...elements, newDoor]);
    }
  };
  
  // Add a window to a wall
  const handleAddWindow = (position) => {
    const snappedPos = snapToGrid(position);
    
    // Find the closest wall to place the window on
    const walls = elements.filter(e => e.type === 'wall');
    if (walls.length === 0) return;
    
    let closestWall = null;
    let minDistance = Infinity;
    let windowPosition = { x: 0, y: 0 };
    
    walls.forEach(wall => {
      const [x1, y1, x2, y2] = wall.points;
      
      // Calculate the projection of the point onto the wall line
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      if (length === 0) return;
      
      const t = ((snappedPos.x - x1) * (x2 - x1) + (snappedPos.y - y1) * (y2 - y1)) / (length * length);
      
      // Check if projection is on the wall segment
      if (t < 0 || t > 1) return;
      
      const projX = x1 + t * (x2 - x1);
      const projY = y1 + t * (y2 - y1);
      
      const distance = Math.sqrt(Math.pow(snappedPos.x - projX, 2) + Math.pow(snappedPos.y - projY, 2));
      
      if (distance < minDistance) {
        minDistance = distance;
        closestWall = wall;
        windowPosition = { x: projX, y: projY };
      }
    });
    
    // Only add window if it's close enough to a wall (within 50px)
    if (closestWall && minDistance <= 50) {
      const [x1, y1, x2, y2] = closestWall.points;
      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      
      const newWindow = {
        id: uuidv4(),
        type: 'window',
        name: `WIN-${elements.filter(e => e.type === 'window').length + 1}`,
        x: windowPosition.x,
        y: windowPosition.y,
        width: 1200,  // Default window width
        height: 1200, // Default window height
        wallId: closestWall.id,
        angle: angle,
        thickness: closestWall.thickness
      };
      
      setElements([...elements, newWindow]);
    }
  };
  
  // Draw grid lines
  const renderGrid = () => {
    if (!gridSettings.showGrid) return null;
    
    const gridLines = [];
    const { width, height } = stageSize;
    const { gridSize } = gridSettings;
    
    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      gridLines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, height]}
          stroke="#ddd"
          strokeWidth={1}
        />
      );
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      gridLines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, width, y]}
          stroke="#ddd"
          strokeWidth={1}
        />
      );
    }
    
    return gridLines;
  };

  return (
    <div className="canvas-container">
      <Toolbar
        mode={mode}
        setMode={setMode}
        materialProps={materialProps}
        setMaterialProps={setMaterialProps}
        gridSettings={gridSettings}
        setGridSettings={setGridSettings}
        wallProps={wallProps}
        setWallProps={setWallProps}
      />
      
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        ref={stageRef}
        onClick={(e) => {
          const pos = stageRef.current.getPointerPosition();
          if (mode === 'column') {
            handleAddColumn(pos);
          } else if (mode === 'door') {
            handleAddDoor(pos);
          } else if (mode === 'window') {
            handleAddWindow(pos);
          }
        }}
        onMouseDown={(e) => {
          const pos = stageRef.current.getPointerPosition();
          if (mode === 'beam') {
            handleAddBeam(pos);
          } else if (mode === 'wall') {
            handleStartDrawingWall(pos);
          }
        }}
        onMouseMove={(e) => {
          if (mode === 'wall' && isDrawing) {
            handleDrawWall(stageRef.current.getPointerPosition());
          }
        }}
        onMouseUp={() => {
          if (mode === 'wall' && isDrawing) {
            handleFinishDrawingWall();
          }
        }}
      >
        <Layer ref={layerRef}>
          {renderGrid()}
          {elements.map((element) => (
            <ElementRenderer
              key={element.id}
              element={element}
              isSelected={selectedElement?.id === element.id}
              onSelect={() => setSelectedElement(element)}
              onUpdate={(updates) => setElements(elements.map(el => 
                el.id === element.id ? { ...el, ...updates } : el
              ))}
            />
          ))}
        </Layer>
      </Stage>

      {selectedElement && (
        <PropertiesPanel
          element={selectedElement}
          onUpdate={(updates) => setElements(elements.map(el => 
            el.id === selectedElement.id ? { ...el, ...updates } : el
          ))}
          onClose={() => setSelectedElement(null)}
        />
      )}
    </div>
    );

};

const ElementRenderer = ({ element, onSelect, onUpdate }) => {
  if (element.type === 'column') {
    return (
      <Group onClick={onSelect}>
        <Rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill="#95a5a6"
          stroke="black"
          strokeWidth={1}
        />
        <Text
          x={element.x + 5}
          y={element.y + 5}
          text={element.name}
          fontSize={14}
          fill="white"
        />
      </Group>
    );
  }

  if (element.type === 'beam') {
    return (
      <Group onClick={onSelect}>
        <Line
          points={element.points}
          stroke="#e74c3c"
          strokeWidth={element.depth}
          lineCap="round"
          lineJoin="round"
        />
        <Text
          x={(element.points[0] + element.points[2]) / 2}
          y={(element.points[1] + element.points[3]) / 2}
          text={element.name}
          fontSize={14}
          fill="white"
        />
      </Group>
    );
  }
  
  if (element.type === 'wall') {
    const [x1, y1, x2, y2] = element.points;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    
    return (
      <Group onClick={onSelect}>
        <Line
          points={element.points}
          stroke="#34495e"
          strokeWidth={element.thickness}
          lineCap="butt"
          lineJoin="miter"
        />
        <Text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2}
          text={element.name}
          fontSize={14}
          fill="white"
          rotation={angle * 180 / Math.PI}
          offsetX={-20}
        />
      </Group>
    );
  }
  
  if (element.type === 'door') {
    // Draw door as a rectangle with an arc to show swing direction
    return (
      <Group onClick={onSelect}>
        <Rect
          x={element.x - element.width / 2}
          y={element.y - element.thickness / 2}
          width={element.width}
          height={element.thickness}
          fill="#3498db"
          rotation={element.angle}
          offsetX={0}
          offsetY={0}
        />
        {/* Door swing arc */}
        <Line
          points={[
            element.x, element.y,
            element.x + element.width * 0.8 * Math.cos((element.angle + 90) * Math.PI / 180), 
            element.y + element.width * 0.8 * Math.sin((element.angle + 90) * Math.PI / 180)
          ]}
          stroke="#3498db"
          strokeWidth={2}
          dash={[5, 5]}
        />
        <Text
          x={element.x}
          y={element.y}
          text={element.name}
          fontSize={14}
          fill="black"
          rotation={element.angle}
        />
      </Group>
    );
  }
  
  if (element.type === 'window') {
    // Draw window as a rectangle with lines to indicate glass
    return (
      <Group onClick={onSelect}>
        <Rect
          x={element.x - element.width / 2}
          y={element.y - element.thickness / 2}
          width={element.width}
          height={element.thickness}
          fill="#ecf0f1"
          stroke="#bdc3c7"
          strokeWidth={2}
          rotation={element.angle}
          offsetX={0}
          offsetY={0}
        />
        {/* Window panes */}
        <Line
          points={[
            element.x - element.width / 4, element.y - element.thickness / 2,
            element.x - element.width / 4, element.y + element.thickness / 2
          ]}
          stroke="#bdc3c7"
          strokeWidth={2}
          rotation={element.angle}
          offsetX={0}
          offsetY={0}
        />
        <Line
          points={[
            element.x + element.width / 4, element.y - element.thickness / 2,
            element.x + element.width / 4, element.y + element.thickness / 2
          ]}
          stroke="#bdc3c7"
          strokeWidth={2}
          rotation={element.angle}
          offsetX={0}
          offsetY={0}
        />
        <Text
          x={element.x}
          y={element.y}
          text={element.name}
          fontSize={14}
          fill="black"
          rotation={element.angle}
        />
      </Group>
    );
  }
};

export default FloorCanvas;