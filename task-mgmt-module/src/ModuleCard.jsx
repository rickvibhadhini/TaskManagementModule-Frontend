import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Typography, Card, Button, Badge, Col } from "antd";
import { useTheme } from "./ThemeContext";

const { Title, Text, Paragraph } = Typography;

const ModuleCard = ({ view, index }) => {
  const { themeValues } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const displayName = view.id === 3 && isHovered ? view.hoverName : view.name;

  return (
    <Col xs={24} md={12} lg={8} key={view.id}>
      <div
        className="card-container"
        style={{ 
          opacity: 0,
          animation: `fadeIn 0.5s ease-out ${0.1 + index * 0.1}s forwards`,
          height: '100%'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link to={view.path} style={{ textDecoration: 'none' }}>
          <Card 
            hoverable
            className="module-card"
            style={{ 
              overflow: 'hidden',
              height: '100%',
              background: themeValues.cardBackground,
              borderColor: themeValues.cardBorder,
              boxShadow: themeValues.cardShadow
            }}
            bodyStyle={{ padding: '20px' }}
            cover={
              <div style={{ position: 'relative', height: '192px' }}>
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.4), transparent)',
                  zIndex: 1 
                }} />
                
                <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
                  <Badge 
                    count={view.badgeText} 
                    style={{ 
                      backgroundColor: view.color,
                      fontSize: '12px',
                      fontWeight: 500
                    }} 
                  />
                </div>
                
                <img
                  alt={view.name}
                  src={view.image}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transition: 'transform 0.7s ease'
                  }}
                  className="card-image"
                />
                
                <div style={{ 
                  position: 'absolute', 
                  bottom: '16px', 
                  left: '16px', 
                  zIndex: 2 
                }}>
                  <Text strong style={{ 
                    color: '#fff', 
                    fontSize: '20px',
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                  }}>
                    {displayName}
                  </Text>
                </div>
              </div>
            }
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '12px'
            }}>
              <div>
                <Title level={4} style={{ 
                  margin: '0 0 4px 0',
                  color: themeValues.primaryText
                }}>
                  {displayName}
                </Title>
                <Paragraph style={{ 
                  margin: 0,
                  color: themeValues.secondaryText,
                  fontSize: '14px'
                }}>
                  {view.description}
                </Paragraph>
              </div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: `${view.color}20`,
                color: view.color,
                fontSize: '20px'
              }}>
                {view.icon}
              </div>
            </div>
            
            <div style={{ 
              margin: '16px 0',
              borderTop: `1px solid ${themeValues.dividerColor}`
            }} />
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <Text style={{ 
                fontSize: '12px',
                color: themeValues.tertiaryText
              }}>
                
              </Text>
              <Button 
                type="primary"
                style={{ 
                  background: view.color,
                  borderColor: view.color
                }}
              >
                View
              </Button>
            </div>
          </Card>
        </Link>
      </div>
    </Col>
  );
};

<<<<<<< HEAD
export default ModuleCard;
=======
export default ModuleCard;
>>>>>>> d16b356694f3de0b540b42ba3b926b381e77995e
