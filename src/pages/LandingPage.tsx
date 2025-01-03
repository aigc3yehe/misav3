import { Box, Card, Typography, Button, styled, InputBase } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCurrentAgent } from '../store/slices/agentSlice';
import livingroomIcon from '../assets/livingroom.svg';
import pointingCursor from '../assets/pointer.png';
import logoImage from '../assets/mirae_studio.png';
import enterIcon from '../assets/uil_enter.svg';
import { useState } from 'react';
import lineSvg from '../assets/line.svg';

const PageContainer = styled(Box)({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: '#2B1261',
});

const Header = styled(Box)({
  height: 103,
  width: '100%',
  padding: '30px 40px',
  display: 'flex',
  alignItems: 'center',
});

const Logo = styled('img')({
  width: 93,
  height: 35,
});

const Content = styled(Box)({
  height: 606,
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '32px',
  overflow: 'hidden',
  paddingLeft: 60,
  '@media (min-width: 1920px)': {
    paddingLeft: 200,
  }
});

const ContentInner = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '100%',
});

const BackgroundContainer = styled(Box)({
  position: 'absolute',
  top: 312,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '300vw',
  height: 129,
  display: 'flex',
  justifyContent: 'center',
});

const BackgroundLine = styled('img')({
  height: 129,
  transform: 'translateX(356px)',
});

const BackgroundLine2 = styled('img')({
    height: 129,
});

const BackgroundLine3 = styled('img')({
    height: 129,
    transform: 'translateX(-356px)',
});

const CardsContainer = styled(Box)({
    position: 'absolute',
    top: 143,
    left: 607,
    display: 'flex',
    gap: '25px',
    zIndex: 1,
});

const Footer = styled(Box)({
  height: 143,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const InputContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'focused'
})<{ focused: boolean }>(({ focused }) => ({
  width: 874,
  height: 63,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: 8,
  padding: '15px 25px',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  border: focused ? '1px solid #C9ACFF' : '1px solid rgba(0, 0, 0, 0.8)',
  transition: 'border 0.2s ease',
}));

const StyledInput = styled(InputBase)({
  width: 669,
  height: 20,
  color: '#D6C0FF',
  fontSize: 14,
  lineHeight: '140%',
  '& .MuiInputBase-input': {
    padding: 0,
  },
});

const GenerateButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'hasContent'
})<{ hasContent: boolean }>(({ hasContent }) => ({
  width: 141,
  height: 35,
  borderRadius: 4,
  backgroundColor: hasContent ? 'rgba(199, 255, 140, 0.1)' : 'transparent',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '5px 16px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: hasContent ? 'rgba(199, 255, 140, 0.2)' : 'transparent',
  },
}));

const EnterIcon = styled('img')({
  width: 24,
  height: 24,
});

const ButtonText = styled('span')({
  fontSize: 18,
  lineHeight: '140%',
  color: '#C7FF8C',
  fontWeight: 400,
  textTransform: 'none',
});

const AgentCard = styled(Card)({
  width: 332,
  height: 363,
  padding: 20,
  borderRadius: 4,
  backgroundColor: '#A276FF',
  backgroundImage: `linear-gradient(135deg, #9a6bff 25%, transparent 25%), 
                   linear-gradient(225deg, #9a6bff 25%, transparent 25%), 
                   linear-gradient(45deg, #9a6bff 25%, transparent 25%), 
                   linear-gradient(315deg, #9a6bff 25%, #A276FF 25%)`,
  backgroundPosition: '40px 0, 40px 0, 0 0, 0 0',
  backgroundSize: '80px 80px',
  backgroundRepeat: 'repeat',
  cursor: `url(${pointingCursor}), pointer`,
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
});

const AgentImage = styled('img')({
  width: 292,
  height: 200,
  borderRadius: 4,
  objectFit: 'cover',
  display: 'block',
});

const TextContent = styled(Box)({
  width: 292,
  height: 73,
  padding: '10px 0',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const AgentName = styled(Typography)({
  fontSize: 30,
  lineHeight: '24px',
  fontWeight: 'bold',
  color: '#000000',
});

const AgentDescription = styled(Typography)({
  fontSize: 18,
  lineHeight: '24px',
  fontWeight: 500,
  color: '#000000',
});

const ActionButton = styled(Button)<{ disabled?: boolean }>(({ disabled }) => ({
  width: 292,
  height: 50,
  borderRadius: 4,
  backgroundColor: disabled ? '#AAABB4' : '#C7FF8C',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0,
  '&:hover': {
    backgroundColor: disabled ? '#AAABB4' : '#b8ff66',
  },
}));

const ActionText = styled(Typography)<{ disabled?: boolean }>(({ disabled }) => ({
  fontSize: 20,
  lineHeight: '24px',
  fontWeight: 'bold',
  color: disabled ? '#636071' : '#000000',
}));

const ActionIcon = styled('img')({
  width: 30,
  height: 30,
});

const agents = [
    {
      id: 'misato',
      name: '$MISATO',
      avatar: '/misato.jpg',
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      description: 'Co-Founder Of Mirae',
      action: 'CHAT'
    },
    {
        id: '-1',
        name: 'WAITING',
        avatar: '/waiting.jpg',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        description: '...',
        action: 'GENERATING'
    }
];

const TextContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  display: 'flex',
  flexDirection: 'column',
});

const TitleContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '24px',
});

const TitleText = styled(Typography)({
  fontSize: 80,
  lineHeight: '110%',
  fontWeight: 800,
  color: '#FFFFFF',
});

const HighlightText = styled('span')({
  color: '#C9ACFF',
});

const DescriptionText = styled(Typography)({
  position: 'absolute',
  top: 336,
  left: 0,
  display: 'flex',
  flexDirection: 'column',
  width: 448,
  fontSize: 18,
  lineHeight: '140%',
  fontWeight: 400,
  color: '#FFFFFF',
  '& span': {
    fontWeight: 400,
  },
});

const IntegrationText = styled(Typography)({
  position: 'absolute',
  left: 607,
  top: 10,
  width: 574,
  fontSize: 18,
  lineHeight: '140%',
  fontWeight: 400,
  color: '#FFFFFF',
});

const ApplyButton = styled(Button)({
  position: 'absolute',
  left: 607,
  top: 71,
  width: 276,
  height: 40,
  borderRadius: 4,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid #FFFFFF',
  padding: '8px 0px',
  transition: 'all 0.2s ease',
  color: '#FFFFFF',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid #C7FF8C',
    color: '#C7FF8C',
  },
});

const ApplyButtonText = styled(Typography)({
  fontSize: 20,
  lineHeight: '100%',
  fontWeight: 500,
  color: 'inherit',
  textTransform: 'none',
});

export default function LandingPage() {
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleGenerate = () => {
    if (!inputValue) return;
    // 处理生成逻辑
  };

  const handleSelectAgent = (agentId: string) => {
    if (agentId === '-1') return; // 如果是不可用状态，直接返回
    const selectedAgent = agents.find(agent => agent.id === agentId);
    if (selectedAgent) {
      dispatch(setCurrentAgent(selectedAgent));
      navigate('/app/living-room');
    }
  };

  const capitalizeWords = (text: string) => {
    return text.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <PageContainer>
      <Header>
        <Logo src={logoImage} alt="Mirae Studio" />
      </Header>
      
      <Content>
        <ContentInner>
          <TextContainer>
            <TitleContainer>
              <TitleText>A STUDIO</TitleText>
              <TitleText>COMPOSED OF</TitleText>
              <TitleText>
                <HighlightText>AGENTS !</HighlightText>
              </TitleText>
            </TitleContainer>
            <DescriptionText>
              {capitalizeWords(
                'Provides interfaces for interacting with agents and various tools needed for agents to complete tasks.'
              )}
            </DescriptionText>
          </TextContainer>

          <IntegrationText>
            Mirae will boost your agent's abilities, making it stronger! Any agent can be integrated !
          </IntegrationText>

          <ApplyButton disableRipple>
            <ApplyButtonText>Apply For Integration &gt;</ApplyButtonText>
          </ApplyButton>

          <CardsContainer>
            {agents.map((agent) => (
              <AgentCard key={agent.id} onClick={() => handleSelectAgent(agent.id)}>
                <AgentImage src={agent.avatar} alt={agent.name} />
                <TextContent>
                  <AgentName>{agent.name}</AgentName>
                  <AgentDescription>{agent.description}</AgentDescription>
                </TextContent>
                <ActionButton 
                  disabled={agent.id === '-1'}
                  disableRipple={agent.id === '-1'}
                >
                  {agent.id !== '-1' && (
                    <ActionIcon src={livingroomIcon} alt="chat" />
                  )}
                  <ActionText disabled={agent.id === '-1'}>
                    {agent.action}
                  </ActionText>
                </ActionButton>
              </AgentCard>
            ))}
          </CardsContainer>
        </ContentInner>

        <BackgroundContainer>
          <BackgroundLine src={lineSvg} alt="" />
          <BackgroundLine2 src={lineSvg} alt="" />
          <BackgroundLine3 src={lineSvg} alt="" />
        </BackgroundContainer>
      </Content>

      <Footer>
        <InputContainer focused={focused}>
          <StyledInput
            placeholder="Type your prompt here..."
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            fullWidth
          />
          <GenerateButton
            hasContent={Boolean(inputValue)}
            onClick={handleGenerate}
            disableRipple
          >
            <EnterIcon src={enterIcon} alt="enter" />
            <ButtonText>
              Generate
            </ButtonText>
          </GenerateButton>
        </InputContainer>
      </Footer>
    </PageContainer>
  );
} 