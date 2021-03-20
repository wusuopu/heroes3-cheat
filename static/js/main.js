'use strict';

const PLAYER_COLORS = ['红', '蓝', '褐', '绿', '棕', '紫', '青', '粉'];
const RESOURCE_NAMES = ['木头', '水银', '石头', '硫磺', '水晶', '宝石', '黄金'];

const BYTES_MAX = {
  2: 0xffff,
  4: 0xffffffff,
}

// 英雄各项值的偏移地址，占用的字节数
const HERO_OFFSET_MAP = {
  '魔法值': [0x18, 2],
  '移动力': [0x4d, 2],
  '经验': [0x51, 4],
  '等级': [0x55, 2],
  '攻击': [0x476, 1],
  '防御': [0x477, 1],
  '力量': [0x478, 1],
  '知识': [0x479, 1],

  '第1格兵数量': [0xad, 4],
  '第2格兵数量': [0xb1, 4],
  '第3格兵数量': [0xb5, 4],
  '第4格兵数量': [0xb9, 4],
  '第5格兵数量': [0xbd, 4],
  '第6格兵数量': [0xc1, 4],
  '第7格兵数量': [0xc5, 4],
  '第1格兵兵种': [0x91, 4],
  '第2格兵兵种': [0x95, 4],
  '第3格兵兵种': [0x99, 4],
  '第4格兵兵种': [0x9d, 4],
  '第5格兵兵种': [0xa1, 4],
  '第6格兵兵种': [0xa5, 4],
  '第7格兵兵种': [0xa9, 4],
  // 1: 初级; 2: 中级; 3: 高级
  '寻路术等级': [0xC9, 1],
  '箭术等级': [0xCA, 1],
  '后勤学等级': [0xCB, 1],
  '侦察术等级': [0xCC, 1],
  '外交术等级': [0xCD, 1],
  '航海术等级': [0xCE, 1],
  '领导术等级': [0xCF, 1],
  '智慧术等级': [0xD0, 1],
  '神秘术等级': [0xD1, 1],
  '幸运术等级': [0xD2, 1],
  '弹道术等级': [0xD3, 1],
  '鹰眼术等级': [0xD4, 1],
  '招魂术等级': [0xD5, 1],
  '理财术等级': [0xD6, 1],
  '火系魔法等级': [0xD7, 1],
  '气系魔法等级': [0xD8, 1],
  '水系魔法等级': [0xD9, 1],
  '土系魔法等级': [0xDA, 1],
  '学术等级': [0xDB, 1],
  '战术等级': [0xDC, 1],
  '炮术等级': [0xDD, 1],
  '学习能力等级': [0xDE, 1],
  '进攻术等级': [0xD, 1],
  '防御术等级': [0xE0, 1],
  '智力等级': [0xE1, 1],
  '魔力等级': [0xE2, 1],
  '抵抗力等级': [0xE3, 1],
  '急救术等级': [0xE4, 1],
  // 28项可学技能的显示位置: 1~28
  '寻路术位置': [0xE5, 1],
  '箭术位置': [0xE6, 1],
  '后勤学位置': [0xE7, 1],
  '侦察术位置': [0xE8, 1],
  '外交术位置': [0xE9, 1],
  '航海术位置': [0xEA, 1],
  '领导术位置': [0xEB, 1],
  '智慧术位置': [0xEC, 1],
  '神秘术位置': [0xED, 1],
  '幸运术位置': [0xEE, 1],
  '弹道术位置': [0xEF, 1],
  '鹰眼术位置': [0xF0, 1],
  '招魂术位置': [0xF1, 1],
  '理财术位置': [0xF2, 1],
  '火系魔法位置': [0xF3, 1],
  '气系魔法位置': [0xF4, 1],
  '水系魔法位置': [0xF5, 1],
  '土系魔法位置': [0xF6, 1],
  '学术位置': [0xF7, 1],
  '战术位置': [0xF8, 1],
  '炮术位置': [0xF9, 1],
  '学习能力位置': [0xFA, 1],
  '进攻术位置': [0xFB, 1],
  '防御术位置': [0xFC, 1],
  '智力位置': [0xFD, 1],
  '魔力位置': [0xFE, 1],
  '抵抗力位置': [0xFF, 1],
  '急救术位置': [0x100, 1],

  '有魔法书': [0x1B5, 4],
  '士气幸运': [0x107, 1],
}

class Header extends React.Component {
  constructor(props) {
    super(props);
  }
  render () {
    return (
      <ul className="header">
        <li className={"tab" + (this.props.active === 'resource' ? " active" : "")} onClick={this.handleClick('resource')}>资源修改</li>
        <li className={"tab" + (this.props.active === 'hero' ? " active" : "")} onClick={this.handleClick('hero')}>英雄修改</li>
      </ul>
    )
  }
  handleClick (tab) {
    return () => {
      this.props.onClick && this.props.onClick(tab)
    }
  }
}

class PlayerSelect extends React.Component {
  constructor(props) {
    super(props)
  }
  render () {
    let options = _.map(PLAYER_COLORS, (item, index) => {
      return (<option value={index} key={index}>{item}</option>)
    })
    return (
      <div className="player-select">
        选择需要修改的玩家：
        <select disabled={this.props.disabled} onChange={this.handleSelect}>
          {options}
        </select>
        <button onClick={this.props.onRefresh}>刷新数据</button>
      </div>
    )
  }
  handleSelect = (ev) => {
    this.props.onSelect && this.props.onSelect(Number(ev.nativeEvent.target.value))
  }
}

// ================================================================================
class ResourceTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      player: undefined,
      resources: [],
    }
  }
  render () {
    let disabled = _.isUndefined(this.props.game.player)    // 游戏还未开始

    return (
      <div className="tab-item">
        <PlayerSelect
          disabled={disabled}
          onSelect={(player) => this.setState({player: player})}
          onRefresh={this.fetchData}
        />

        {this.renderForm()}
      </div>
    )
  }
  renderForm () {
    const resoueces = (this.state.resources[this.state.player] || {}).data || []
    const eles = _.map(RESOURCE_NAMES, (name, index) => {
      return (
        <span className="resource-item" key={index}>
          <label>{name}</label>
          <input
            value={resoueces[index]}
            onChange={(ev) => this.handleValueChange(ev.target.value, index)}
            type="number"
            max={0x7fffffff}
          />
        </span>
      )
    })
    return (
      <div className="resource-list">
        {eles}
        <button className="resource-item" onClick={this.handleModify}>修改资源</button>
      </div>
    )
  }
  componentDidMount () {
    this.fetchData()
    this.setState({player: this.props.game.player})
  }
  handleValueChange = (value, index) => {
    const data = _.concat([], (this.state.resources[this.state.player] || {}).data || [])
    value = Number(value) || 0
    if (value > 0x7fffffff) { value = 0x7fffffff }
    data[index] = value

    const resouece = _.assign({}, this.state.resources[this.state.player] || {}, {data:data})
    const resources = _.concat([], this.state.resources)
    resources[this.state.player] = resouece
    this.setState({resources: resources})
  }
  handleModify = () => {
    const player = this.state.player
    const data = _.concat([], (this.state.resources[player] || {}).data || [])
    axios.put('/api/v1/resoueces', { player: player, data: data }).then(() => {
      this.setState({
        resources: res.data
      })
    }).catch(() => {
      this.setState({resources: []})
    })
  }
  fetchData = () => {
    axios.get('/api/v1/resoueces').then((res) => {
      this.setState({
        resources: res.data
      })
    }).catch(() => {
      this.setState({resources: []})
    })
  }
}

// ================================================================================
class HeroTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      player: undefined,
      heros: [],
      currentHero: undefined,
      heroInfo: {},
    }
  }
  render () {
    let disabled = _.isUndefined(this.props.game.player)    // 游戏还未开始

    return (
      <div className="tab-item">
        <PlayerSelect
          disabled={disabled}
          onSelect={(player) => this.setState({player: player, currentHero: undefined})}
          onRefresh={this.fetchData}
        />

        {this.renderHeroSelect()}

        {this.renderForm()}
      </div>
    )
  }
  renderHeroSelect () {
    const heros = _.filter(this.state.heros, {player: this.state.player})
    const options = _.concat([<option key={-1} value={undefined}>-</option>], _.map(heros, (h) => {
      return (<option key={h.num} value={h.num}>{h.name}</option>)
    }))
    return (
      <div className="hero-list">
        选择需要修改的英雄：
        <select disabled={_.isEmpty(heros)} onChange={this.handleHeroSelect}>
          {options}
        </select>
        <button onClick={this.handleRefreshHero}>刷新英雄数据</button>
      </div>
    )
  }
  renderForm () {
    if (_.isUndefined(this.state.currentHero) || _.get(this.state.heroInfo, 'num') !== this.state.currentHero) { return }

    const info = this.state.heroInfo

    return (
      <div className="hero-info">
        {this.renderProperySection(info)}
      </div>
    )
  }
  renderProperySection (info) {
    const fields = ['魔法值', '移动力', '经验', '攻击', '防御', '力量', '知识']
    const eles = _.map(fields, (field, index) => {
      return (
        <li className="info-item" key={index}>
          <label>{field}</label>
          <input type="number" max={BYTES_MAX[4]} value={info[field]} onChange={this.handleProperyInputChange(field)} />
        </li>
      )
    })
    return (
      <div className="info-section">
        <h2>基础属性 <button onClick={this.handleProperyModify(fields)}>修改</button></h2>
        <ul className="info-list">
          {eles}
        </ul>
      </div>
    )
  }
  componentDidMount () {
    this.fetchData()
    this.setState({player: this.props.game.player})
  }
  fetchData = () => {
    axios.get('/api/v1/heros').then((res) => {
      this.setState({heros: res.data})
    }).catch(() => {
      this.setState({heros: []})
    })
  }
  handleHeroSelect = (ev) => {
    let currentHero = Number(ev.nativeEvent.target.value)
    this.setState({currentHero: currentHero})
    this.handleRefreshHero(currentHero)
  }
  handleRefreshHero = (currentHero) => {
    // 刷新当前英雄数据
    if (!_.isNumber(currentHero)) {
      currentHero = this.state.currentHero
    }
    if (currentHero >= 0) {
      axios.get(`/api/v1/heros/${currentHero}`).then((res) => {
        let data = res.data
        for (let key in data) {
          if (_.isArray(data[key])) {
            data[key] = data[key][0]
          }
        }
        this.setState({heroInfo: data})
    }).catch(() => {
      this.setState({heroInfo: {}})
    })
    }
  }

  handleProperyInputChange = (field) => {
    return (ev) => {
      let value = Number(ev.nativeEvent.target.value)
      let max = BYTES_MAX[HERO_OFFSET_MAP[field][1]]
      if (value > max) { value = max }
      let heroInfo = _.assign({}, this.state.heroInfo, {[field]: value})
      this.setState({heroInfo})
    }
  }
  handleProperyModify = (fields) => {
    // 修改英雄属性
    return () => {
      const data = _.map(fields, (field) => {
        return {
          offset: HERO_OFFSET_MAP[field][0],
          size: HERO_OFFSET_MAP[field][1],
          value: this.state.heroInfo[field],
        }
      })
      let currentHero = this.state.currentHero
      if (_.isEmpty(data)) { return }
      if (currentHero >= 0) {
        axios.put(`/api/v1/heros/${currentHero}`, {data}).then((res) => {
          let data = res.data
          for (let key in data) {
            if (_.isArray(data[key])) {
              data[key] = data[key][0]
            }
          }
          this.setState({heroInfo: data})
        }).catch(() => {
          this.setState({heroInfo: {}})
        })
      }
    }
  }
}

// ================================================================================
class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tab: '',
      game: {
        player: undefined,
        pid: undefined,
        hd: undefined,
      },
      resources: [],
      heros: [],
    }

    this._timer = undefined
  }
  componentDidMount () {
    // 获取游戏信息
    this.health_check()
  }
  componentWillUnmount () {
    if (this._timer) { clearTimeout(this._timer) }
  }

  render () {
    return (
      <div>
        {this.renderGameInfo()}
        <Header active={this.state.tab} onClick={this.handleTabClick} />
        <div className="body">
          {this.renderResource()}
          {this.renderHero()}
        </div>
      </div>
    )
  }
  renderGameInfo () {
    let version = ''
    if (_.isBoolean(this.state.game.hd)) {
      version = this.state.game.hd ? 'HD版' : '普通版'
    }
    return (
      <div className="game_info">
        {!this.state.game.pid ? <p className="error">游戏未运行</p> : ''}
        <p>
          <span>当前玩家颜色：{PLAYER_COLORS[this.state.game.player]}</span>
          <span>当前游戏进程： {this.state.game.pid}</span>
          <span>当前游戏版本： {version}</span>
          <button onClick={() => window.location.reload()}>刷新页面</button>
        </p>
      </div>
    )
  }
  renderResource () {
    if (!this.state.game.pid || this.state.tab !== 'resource') { return }
    return (
      <ResourceTab game={this.state.game} />
    )
  }
  renderHero () {
    if (!this.state.game.pid || this.state.tab !== 'hero') { return }
    return (
      <HeroTab game={this.state.game} />
    )
  }
  handleTabClick = (tab) => {
    console.log('handleTabClick', tab)
    this.setState({tab: tab})
  }
  health_check = () => {
    axios.get('/api/v1/game_info').then((res) => {
      this.setState({game: {
        player: _.get(res.data, 'player.num'),
        pid: res.data.pid,
        hd: res.data.hd,
      }})
    }).catch((error) => {
      console.log('health_check error:', error)
      this.setState({game: {
        player: undefined,
        pid: undefined,
        hd: undefined,
      }})
    }).then(() => {
      this._timer = setTimeout(this.health_check, 6500)
    })
  }
}

ReactDOM.render(
  <Main />,
  document.getElementById('app_root')
);
