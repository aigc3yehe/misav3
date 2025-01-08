import { styled } from '@mui/material';
import { InputBase, InputBaseProps } from '@mui/material';
import inputDisableIcon from '../assets/input_disable.svg';
import sendIcon from '../assets/send.svg';
import sendDisableIcon from '../assets/send_disable.svg';
import disablePointer from '../assets/disable_pointer.png';
import { useState, KeyboardEvent } from 'react';

const OuterContainer = styled('div', {
  shouldForwardProp: (prop) => !['focused', 'disabled'].includes(prop as string)
})<{ focused?: boolean; disabled?: boolean }>(({ focused, disabled }) => ({
  padding: 6,
  borderRadius: 36,
  background: focused ? 'rgba(34, 17, 110, 0.5)' : 'transparent',
  transition: 'background-color 0.2s ease',
  cursor: disabled ? `url(${disablePointer}), not-allowed` : 'default',
  position: 'relative',
}));

const InputContainer = styled('div')<{ disabled?: boolean }>(({ disabled }) => ({
  width: 655,
  height: 50,
  padding: '0 30px',
  borderRadius: 30,
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  backgroundColor: '#FFFFFF',
  cursor: disabled ? 'not-allowed' : 'default',
}));

const StyledInput = styled(InputBase)(({ disabled }) => ({
  flex: 1,
  '& .MuiInputBase-input': {
    fontSize: 14,
    lineHeight: '140%',
    color: disabled ? '#AAABB4' : '#22116E',
    '&::placeholder': {
      color: '#636071',
      opacity: 1,
    },
  },
}));

const IconWrapper = styled('div')<{ disabled?: boolean }>(({ disabled }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  cursor: disabled ? `url(${disablePointer}), not-allowed !important` : 'pointer',
}));

const LeftContent = styled('div')<{ disabled?: boolean }>(({ disabled }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  cursor: disabled ? `url(${disablePointer}), not-allowed !important` : 'default',
}));

const DisabledText = styled('span')({
  fontSize: 14,
  lineHeight: '140%',
  color: '#AAABB4',
  cursor: `url(${disablePointer}), not-allowed`
});

const Icon = styled('img')<{ disabled?: boolean }>(({ disabled }) => ({
  width: 24,
  height: 24,
  cursor: disabled ? `url(${disablePointer}), not-allowed` : 'pointer',
}));

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress?: (e: KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  inputRef?: InputBaseProps['inputRef'];
  processingState?: 'idle' | 'thinking' | 'generating' | 'minting';
}

export default function ChatInput({ 
  value, 
  onChange, 
  onSend, 
  onKeyPress,
  disabled,
  inputRef,
  processingState = 'idle'
}: ChatInputProps) {
  const [focused, setFocused] = useState(false);

  const getPlaceholder = () => {
    switch (processingState) {
      case 'thinking':
        return 'MISATO is thinking...';
      case 'generating':
        return 'MISATO is generating image...';
      case 'minting':
        return 'MISATO is minting NFT...';
      default:
        return 'Type your message here...';
    }
  };

  const handleSend = () => {
    if (disabled || !value) return;
    onSend();
  };

  return (
    <OuterContainer focused={focused} disabled={disabled}>
      <InputContainer disabled={disabled}>
        <LeftContent disabled={disabled}>
          {disabled ? (
            <IconWrapper>
              <Icon src={inputDisableIcon} alt="disabled" disabled={disabled} />
              <DisabledText>{getPlaceholder()}</DisabledText>
            </IconWrapper>
          ) : (
            <StyledInput
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={getPlaceholder()}
              fullWidth
              onKeyDown={onKeyPress}
              inputRef={inputRef}
            />
          )}
        </LeftContent>
        <IconWrapper onClick={disabled ? undefined : handleSend}>
          <Icon 
            src={disabled || !value ? sendDisableIcon : sendIcon} 
            alt="send"
            disabled={disabled || !value}
          />
        </IconWrapper>
      </InputContainer>
    </OuterContainer>
  );
} 