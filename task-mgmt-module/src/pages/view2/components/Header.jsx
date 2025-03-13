import React from 'react'

const Header = () => {
  return (
    <div>
        <div className="flex items-center space-x-6">
          <div className="mr-6 flex items-center">
            <img src={cars24} alt="" width={100} height={100}/>
          </div>
          <Title level={3} style={{ margin: 0, color: 'white' }}>Agent Metrics Dashboard</Title>
        </div>
        <div className="flex items-center space-x-4">
          <Input 
            placeholder="Enter Agent ID" 
            value={agentId} 
            onChange={handleAgentIdChange} 
            addonAfter={<Button type="primary" icon={<SearchOutlined />}>Search</Button>} 
            style={{ width: 300 }}
          />
          <Select 
            defaultValue="30" 
            style={{ width: 180 }} 
            onChange={handleTimeFrameChange}
          >
            <Option value="7">Last 7 Days</Option>
            <Option value="14">Last 14 Days</Option>
            <Option value="30">Last 30 Days</Option>
          </Select>
        </div>
    </div>
  )
}

export default Header 



{/* <Header className="flex items-center justify-between" style={{ backgroundColor: '#001529', padding: '0 48px', width: '100%', height: '64px' }}>
        <div className="flex items-center space-x-6">
          <div className="mr-6 flex items-center">
            <img src={cars24} alt="" width={100} height={100}/>
          </div>
          <Title level={3} style={{ margin: 0, color: 'white' }}>Agent Metrics Dashboard</Title>
        </div>
        <div className="flex items-center space-x-4">
          <Input 
            placeholder="Enter Agent ID" 
            value={agentId} 
            onChange={handleAgentIdChange} 
            addonAfter={<Button type="primary" icon={<SearchOutlined />}>Search</Button>} 
            style={{ width: 300 }}
          />
          <Select 
            defaultValue="30" 
            style={{ width: 180 }} 
            onChange={handleTimeFrameChange}
          >
            <Option value="7">Last 7 Days</Option>
            <Option value="14">Last 14 Days</Option>
            <Option value="30">Last 30 Days</Option>
          </Select>
        </div>
      </Header> */}