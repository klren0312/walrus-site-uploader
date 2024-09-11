import {
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  Box,
  StepTitle,
  StepDescription,
  StepSeparator,
} from '@chakra-ui/react'
import React from 'react'

export const steps = [
  { title: 'Select Folder', description: 'Choose a folder to upload' },
  { title: 'Upload', description: 'Upload files' },
  { title: 'Configure on Chain', description: 'Set up on the blockchain' },
]

export function UploadStepper({
  activeStep,
}: {
  activeStep: number
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}) {
  return (
    <Stepper index={activeStep}>
      {steps.map((step, index) => (
        <Step key={index}>
          <StepIndicator>
            <StepStatus
              complete={<StepIcon />}
              incomplete={<StepNumber />}
              active={<StepNumber />}
            />
          </StepIndicator>

          <Box flexShrink="0">
            <StepTitle>{step.title}</StepTitle>
            <StepDescription>{step.description}</StepDescription>
          </Box>

          <StepSeparator />
        </Step>
      ))}
    </Stepper>
  )
}
