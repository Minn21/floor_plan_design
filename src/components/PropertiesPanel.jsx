import { Box, TextField, Typography, Paper, IconButton, Divider, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const PropertiesPanel = ({ element, onUpdate, onClose }) => (
  <Paper sx={{ 
    position: 'fixed', 
    right: 0, 
    top: 0, 
    height: '100vh', 
    width: 350, 
    p: 3,
    boxShadow: 3
  }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
      <Typography variant="h6">{element.name} Properties</Typography>
      <IconButton onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </Box>

    <TextField
      label="Element Name"
      fullWidth
      value={element.name}
      onChange={(e) => onUpdate({ name: e.target.value })}
      sx={{ mb: 2 }}
    />

    {element.type === 'column' && (
      <TextField
        label="Column Size (mm)"
        type="number"
        fullWidth
        value={element.width}
        onChange={(e) => onUpdate({ width: e.target.value, height: e.target.value })}
        sx={{ mb: 2 }}
      />
    )}

    {element.type === 'beam' && (
      <>
        <TextField
          label="Beam Width (mm)"
          type="number"
          fullWidth
          value={element.width}
          onChange={(e) => onUpdate({ width: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Beam Depth (mm)"
          type="number"
          fullWidth
          value={element.depth}
          onChange={(e) => onUpdate({ depth: e.target.value })}
          sx={{ mb: 2 }}
        />
      </>
    )}
    
    {element.type === 'wall' && (
      <>
        <TextField
          label="Wall Thickness (mm)"
          type="number"
          fullWidth
          value={element.thickness}
          onChange={(e) => onUpdate({ thickness: parseInt(e.target.value) || 200 })}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Wall Height (mm)"
          type="number"
          fullWidth
          value={element.height}
          onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 2400 })}
          sx={{ mb: 2 }}
        />
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" gutterBottom>Wall Measurements</Typography>
        <TextField
          label="Length (mm)"
          type="number"
          fullWidth
          disabled
          value={Math.round(Math.sqrt(
            Math.pow(element.points[2] - element.points[0], 2) + 
            Math.pow(element.points[3] - element.points[1], 2)
          ))}
          sx={{ mb: 2 }}
        />
      </>
    )}
    
    {element.type === 'door' && (
      <>
        <TextField
          label="Door Width (mm)"
          type="number"
          fullWidth
          value={element.width}
          onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 900 })}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Door Height (mm)"
          type="number"
          fullWidth
          value={element.height}
          onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 2100 })}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Swing Direction</InputLabel>
          <Select
            value={element.swingDirection || 'left'}
            label="Swing Direction"
            onChange={(e) => onUpdate({ swingDirection: e.target.value })}
          >
            <MenuItem value="left">Left</MenuItem>
            <MenuItem value="right">Right</MenuItem>
          </Select>
        </FormControl>
      </>
    )}
    
    {element.type === 'window' && (
      <>
        <TextField
          label="Window Width (mm)"
          type="number"
          fullWidth
          value={element.width}
          onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 1200 })}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Window Height (mm)"
          type="number"
          fullWidth
          value={element.height}
          onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 1200 })}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Sill Height (mm)"
          type="number"
          fullWidth
          value={element.sillHeight || 900}
          onChange={(e) => onUpdate({ sillHeight: parseInt(e.target.value) || 900 })}
          sx={{ mb: 2 }}
        />
      </>
    )}
  </Paper>
);

export default PropertiesPanel;