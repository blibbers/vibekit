import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Plus } from 'lucide-react'

interface FeaturesInputProps {
  features: string[]
  onChange: (features: string[]) => void
  label?: string
  placeholder?: string
}

export function FeaturesInput({ 
  features, 
  onChange, 
  label = 'Features',
  placeholder = 'Enter a feature...'
}: FeaturesInputProps) {
  const [newFeature, setNewFeature] = useState('')

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      onChange([...features, newFeature.trim()])
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    onChange(features.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addFeature()
    }
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* Existing features */}
      {features.length > 0 && (
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <span className="flex-1 text-sm">{feature}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFeature(index)}
                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new feature */}
      <div className="flex gap-2">
        <Input
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addFeature}
          disabled={!newFeature.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Press Enter or click + to add a feature. Click X to remove.
      </p>
    </div>
  )
}