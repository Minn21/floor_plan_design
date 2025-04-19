import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  Typography, 
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  ButtonGroup,
  Tooltip
} from '@mui/material';
import Image from 'next/image';

const Toolbar = ({ mode, setMode, materialProps, setMaterialProps, gridSettings, setGridSettings, wallProps, setWallProps }) => (
  <Paper sx={{ p: 2, m: 2, width: 350 }}>
    <Typography variant="h6" gutterBottom>Structural Elements</Typography>
    
    <Box sx={{ mb: 3 }}>
      <Button 
        variant={mode === 'column' ? 'contained' : 'outlined'} 
        onClick={() => setMode('column')}
        sx={{ mr: 2 }}
      >
        Add Column
      </Button>
      <Button
        variant={mode === 'beam' ? 'contained' : 'outlined'}
        onClick={() => setMode('beam')}
      >
        Add Beam
      </Button>
    </Box>
    
    <Divider sx={{ my: 2 }} />
    
    <Typography variant="h6" gutterBottom>Architectural Elements</Typography>
    
    <Box sx={{ mb: 3 }}>
      <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
        <Tooltip title="Add Wall">
          <Button 
            variant={mode === 'wall' ? 'contained' : 'outlined'}
            onClick={() => setMode('wall')}
            sx={{ display: 'flex', flexDirection: 'column', p: 1 }}
          >
            <Image src="/wall.svg" width={24} height={24} alt="Wall" />
            <Typography variant="caption" sx={{ mt: 0.5 }}>Wall</Typography>
          </Button>
        </Tooltip>
        <Tooltip title="Add Door">
          <Button 
            variant={mode === 'door' ? 'contained' : 'outlined'}
            onClick={() => setMode('door')}
            sx={{ display: 'flex', flexDirection: 'column', p: 1 }}
          >
            <Image src="/door.svg" width={24} height={24} alt="Door" />
            <Typography variant="caption" sx={{ mt: 0.5 }}>Door</Typography>
          </Button>
        </Tooltip>
        <Tooltip title="Add Window">
          <Button 
            variant={mode === 'window' ? 'contained' : 'outlined'}
            onClick={() => setMode('window')}
            sx={{ display: 'flex', flexDirection: 'column', p: 1 }}
          >
            <Image src="/window.svg" width={24} height={24} alt="Window" />
            <Typography variant="caption" sx={{ mt: 0.5 }}>Window</Typography>
          </Button>
        </Tooltip>
      </ButtonGroup>
    </Box>

    <Typography variant="h6" gutterBottom>Material Properties</Typography>
    
    {(mode === 'wall' || mode === 'door' || mode === 'window') && (
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Wall Thickness (mm)"
          type="number"
          fullWidth
          value={wallProps?.thickness || 200}
          onChange={(e) => setWallProps({...wallProps, thickness: parseInt(e.target.value) || 200})}
          sx={{ mb: 2 }}
        />
        {mode === 'wall' && (
          <TextField
            label="Wall Height (mm)"
            type="number"
            fullWidth
            value={wallProps?.height || 2400}
            onChange={(e) => setWallProps({...wallProps, height: parseInt(e.target.value) || 2400})}
            sx={{ mb: 2 }}
          />
        )}
      </Box>
    )}
    
    <TextField
      label="Concrete Grade"
      select
      fullWidth
      value={materialProps.concreteGrade}
      onChange={(e) => setMaterialProps({...materialProps, concreteGrade: e.target.value})}
      sx={{ mb: 2 }}
    >
      {['C20', 'C25', 'C30', 'C35'].map((grade) => (
        <MenuItem key={grade} value={grade}>{grade}</MenuItem>
      ))}
    </TextField>

    <TextField
      label="Column Size (mm)"
      type="number"
      fullWidth
      value={materialProps.columnSize}
      onChange={(e) => setMaterialProps({...materialProps, columnSize: e.target.value})}
      sx={{ mb: 2 }}
    />
    
    <Divider sx={{ my: 2 }} />
    
    <Typography variant="h6" gutterBottom>Grid Settings</Typography>
    
    <FormControlLabel
      control={
        <Switch
          checked={gridSettings.showGrid}
          onChange={(e) => setGridSettings({...gridSettings, showGrid: e.target.checked})}
        />
      }
      label="Show Grid"
      sx={{ mb: 1, display: 'block' }}
    />
    
    <FormControlLabel
      control={
        <Switch
          checked={gridSettings.snapToGrid}
          onChange={(e) => setGridSettings({...gridSettings, snapToGrid: e.target.checked})}
        />
      }
      label="Snap to Grid"
      sx={{ mb: 2, display: 'block' }}
    />
    
    <TextField
      label="Grid Size (px)"
      type="number"
      fullWidth
      value={gridSettings.gridSize}
      onChange={(e) => setGridSettings({...gridSettings, gridSize: parseInt(e.target.value) || 50})}
      sx={{ mb: 2 }}
      InputProps={{ inputProps: { min: 10, max: 200 } }}
    />
  </Paper>
);

export default Toolbar;