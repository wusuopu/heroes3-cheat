'use strict';

const PLAYER_COLORS = ['红色', '蓝色', '褐色', '绿色', '棕色', '紫色', '青色', '粉色'];
const RESOURCE_NAMES = ['木头', '水银', '石头', '硫磺', '水晶', '宝石', '黄金'];
const ALL_OBJECTS = {
  0x00: '魔法书',
  0x01: '魔法卷轴',
  0x02: '神器',
  0x03: '投石车',
  0x04: '弩车',
  0x05: '补给车',
  0x06: '急救帐篷',
  0x07: '人马战斧',
  0x08: '黑魔剑',
  0x09: '狼人连枷',
  0x0A: '恶魔之棒',
  0x0B: '火神剑',
  0x0C: '泰坦之剑',
  0x0D: '矮人王盾',
  0x0E: '亡灵盾',
  0x0F: '狼人王盾',
  0x10: '狂魔盾',
  0x11: '邪盾',
  0x12: '守护神之盾',
  0x13: '神兽之冠',
  0x14: '骷髅冠',
  0x15: '混沌之冠',
  0x16: '智慧之冠',
  0x17: '地狱王冠',
  0x18: '雷神之盔',
  0x19: '藤木甲',
  0x1A: '骨质胸甲',
  0x1B: '大蛇神胸甲',
  0x1C: '巨人战甲',
  0x1D: '黄金甲',
  0x1E: '泰坦战甲',
  0x1F: '神奇战甲',
  0x20: '圣靴',
  0x21: '天使项链',
  0x22: '狮王盾',
  0x23: '先知剑',
  0x24: '神谕之冠',
  0x25: '龙眼戒',
  0x26: '赤龙剑',
  0x27: '龙盾',
  0x28: '龙甲',
  0x29: '龙骨胫甲',
  0x2A: '龙翼袍',
  0x2B: '龙牙项链',
  0x2C: '龙牙冠',
  0x2D: '龙眼指环',
  0x2E: '幸运三叶草',
  0x2F: '预言卡',
  0x30: '幸运鸟',
  0x31: '勇气勋章',
  0x32: '勇士勋章',
  0x33: '勇士令',
  0x34: '窥镜',
  0x35: '望远镜',
  0x36: '亡灵护身符',
  0x37: '吸血鬼披风',
  0x38: '死神靴',
  0x39: '抗魔链',
  0x3A: '抗魔披风',
  0x3B: '抗魔靴',
  0x3C: '树精灵之弓',
  0x3D: '神兽之鬃',
  0x3E: '天羽箭',
  0x3F: '神目鸟',
  0x40: '火眼人',
  0x41: '真理徽章',
  0x42: '政治家勋章',
  0x43: '礼仪之戒',
  0x44: '大使勋带',
  0x45: '旅行者之戒',
  0x46: '骑士手套',
  0x47: '海神项链',
  0x48: '织天之翼',
  0x49: '魔力护符',
  0x4A: '魔法护符',
  0x4B: '魔力球',
  0x4C: '魔力项圈',
  0x4D: '魔戒',
  0x4E: '魔法披风',
  0x4F: '气灵球',
  0x50: '土灵球',
  0x51: '火灵球',
  0x52: '水灵球',
  0x53: '禁魔披风',
  0x54: '禁锢之灵',
  0x55: '恶运沙漏',
  0x56: '火系魔法书',
  0x57: '气系魔法书',
  0x58: '水系魔法书',
  0x59: '土系魔法书',
  0x5A: '水神靴',
  0x5B: '黄金弓',
  0x5C: '永恒之球',
  0x5D: '毁灭之球',
  0x5E: '活力之戒',
  0x5F: '生命之戒',
  0x60: '活力圣瓶',
  0x61: '极速项链',
  0x62: '神行靴',
  0x63: '极速披风',
  0x64: '冷静挂件',
  0x65: '光明挂件',
  0x66: '神圣挂件',
  0x67: '生命挂件',
  0x68: '死神挂件',
  0x69: '自由挂件',
  0x6A: '电神挂件',
  0x6B: '清醒挂件',
  0x6C: '勇气挂件',
  0x6D: '水晶披风',
  0x6E: '宝石戒指',
  0x6F: '水银瓶',
  0x70: '矿石车',
  0x71: '硫磺指环',
  0x72: '木材车',
  0x73: '黄金囊',
  0x74: '黄金袋',
  0x75: '黄金包',
  0x76: '天赐神足',
  0x77: '天赐神胯',
  0x78: '天赐神躯',
  0x79: '天赐神臂',
  0x7A: '天赐神首',
  0x7B: '航海家之帽',
  0x7C: '魔法师之帽',
  0x7D: '战争枷锁',
  0x7E: '禁魔球',
  0x7F: '龙之血瓶',
  0x80: '末日之刃',
  0x81: '天使联盟',
  0x82: '鬼王斗篷',
  0x83: '神圣血瓶',
  0x84: '诅咒铠甲',
  0x85: '天赐神兵',
  0x86: '龙王神力',
  0x87: '泰坦之箭',
  0x88: '海洋之帽',
  0x89: '幻影神弓',
  0x8A: '魔力源泉',
  0x8B: '法师之戒',
  0x8C: '丰收之角',
}
const ALL_CREATURES = {
  0x00: '枪兵',
  0x01: '戟兵',
  0x02: '弓箭兵',
  0x03: '神射手',
  0x04: '狮鹫',
  0x05: '皇家狮鹫',
  0x06: '剑士',
  0x07: '十字军',
  0x08: '僧侣',
  0x09: '祭司',
  0x0A: '骑兵',
  0x0B: '骑士',
  0x0C: '天使',
  0x0D: '大天使',
  0x0E: '半人马',
  0x0F: '半人马首领',
  0x10: '矮人',
  0x11: '战斗矮人',
  0x12: '木精灵',
  0x13: '大精灵',
  0x14: '飞马',
  0x15: '银飞马',
  0x16: '枯木卫士',
  0x17: '枯木战士',
  0x18: '独角兽',
  0x19: '独角神兽',
  0x1A: '绿龙',
  0x1B: '金龙',
  0x1C: '小妖精',
  0x1D: '大妖精',
  0x1E: '石像鬼',
  0x1F: '石像怪',
  0x20: '石人',
  0x21: '铁人',
  0x22: '法师',
  0x23: '大法师',
  0x24: '神怪',
  0x25: '神怪主',
  0x26: '蛇女',
  0x27: '蛇妖',
  0x28: '巨人',
  0x29: '泰坦巨人',
  0x2A: '小怪物',
  0x2B: '怪物',
  0x2C: '歌革',
  0x2D: '玛各',
  0x2E: '地狱猎犬',
  0x2F: '三首猎犬',
  0x30: '恶鬼',
  0x31: '长角恶鬼',
  0x32: '邪神',
  0x33: '邪神王',
  0x34: '火精灵',
  0x35: '烈火精灵',
  0x36: '恶魔',
  0x37: '大恶魔',
  0x38: '骷髅兵',
  0x39: '骷髅勇士',
  0x3A: '行尸',
  0x3B: '僵尸',
  0x3C: '幽灵',
  0x3D: '阴魂',
  0x3E: '吸血鬼',
  0x3F: '吸血鬼王',
  0x40: '尸巫',
  0x41: '尸巫王',
  0x42: '暗黑骑士',
  0x43: '恐怖骑士',
  0x44: '骨龙',
  0x45: '鬼龙',
  0x46: '洞穴人',
  0x47: '地狱洞穴人',
  0x48: '鹰身女妖',
  0x49: '鹰身女巫',
  0x4A: '斜眼',
  0x4B: '毒眼',
  0x4C: '美杜莎',
  0x4D: '美杜莎女王',
  0x4E: '牛头怪',
  0x4F: '牛头王',
  0x50: '蝎狮',
  0x51: '毒蝎狮',
  0x52: '赤龙',
  0x53: '黑龙',
  0x54: '大耳怪',
  0x55: '大耳怪王',
  0x56: '恶狼骑士',
  0x57: '恶狼斗士',
  0x58: '半兽人',
  0x59: '半兽人首领',
  0x5A: '食人魔',
  0x5B: '食人魔王',
  0x5C: '大雕',
  0x5D: '雷鸟',
  0x5E: '独眼巨人',
  0x5F: '独眼王',
  0x60: '比蒙',
  0x61: '比蒙巨兽',
  0x62: '狼人',
  0x63: '大狼人',
  0x64: '蜥蜴人',
  0x65: '蜥蜴勇士',
  0x66: '毒蝇',
  0x67: '龙蝇',
  0x68: '蜥蜴',
  0x69: '巨蜥',
  0x6A: '野牛',
  0x6B: '蛮牛',
  0x6C: '飞龙',
  0x6D: '飞龙王',
  0x6E: '九头怪',
  0x6F: '终极九头怪',
  0x70: '气元素',
  0x71: '土元素',
  0x72: '火元素',
  0x73: '水元素',
  0x74: '金人',
  0x75: '钻石人',
  0x76: '小精灵',
  0x77: '精灵',
  0x78: '精神元素',
  0x79: '魔法元素',
  0x7A: '',
  0x7B: '冰元素',
  0x7C: '',
  0x7D: '石元素',
  0x7E: '',
  0x7F: '雷元素',
  0x80: '',
  0x81: '烈火元素',
  0x82: '火鸟',
  0x83: '凤凰',
  0x84: '圣龙',
  0x85: '水晶龙',
  0x86: '紫龙',
  0x87: '毒龙',
  0x88: '魔幻法师',
  0x89: '幻影射手',
  0x8A: '投石矮人',
  0x8B: '农民',
  0x8C: '野猪',
  0x8D: '木乃伊',
  0x8E: '游牧民',
  0x8F: '盗贼',
  0x90: '恶鬼',
}

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
  '进攻术等级': [0xDF, 1],
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
  '技能个数': [0x101, 1],

  '有魔法书': [0x1B5, 4],
  '士气幸运': [0x107, 1],       // 0b11000000 0xC0 高士气，高幸运
}
_.times(64, (i) => {
  HERO_OFFSET_MAP['行囊' + _.padStart(i+1, 2, '0')] = [0x1d4 + (8*i), 4]
  HERO_OFFSET_MAP['行囊' + _.padStart(i+1, 2, '0') + '属性'] = [0x1d4 + (8*i) + 4, 4]
})


class Modal extends React.Component {
  constructor(props) {
    super(props)
  }

  render () {
    if (!this.props.visible) {
      return (<div></div>)
    }

    return (
      <div className="modal">
        <div className="modal-mask" onClick={() => {
          this.props.onClose && this.props.onClose()
        }}>
        </div>
        <div className="modal-body">
          {this.props.children}
        </div>
      </div>
    )
  }
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
      return (
        <li key={index} className={`player-item ${this.props.value === index ? 'active' : ''}`} onClick={() => this.handleSelect(index)}>
          <i className={`icon icon-players icon-players-${index}`}></i>
        </li>
      )
    })
    return (
      <div className="player-select">
        选择需要修改的玩家：
        <ul className="player-list">
          {options}
        </ul>
        <button onClick={this.props.onRefresh}>刷新数据</button>
      </div>
    )
  }
  handleSelect = (value) => {
    this.props.onSelect && this.props.onSelect(Number(value))
  }
}
class HeroAvator extends React.Component {
  constructor(props) {
    super(props)
  }
  render () {
    let avator = _.get(this.props.hero, 'avator')
    let name = _.get(this.props.hero, 'name', '')
    return (
      <div className={`hero-avator ${this.props.active ? 'active' : ''}`} onClick={this.handleClick}>
        <div>
          <i className={`icon icon-heros-${avator}`}></i>
        </div>
        <div>{name}</div>
      </div>
    )
  }
  handleClick = () => {
    let num = this.props.hero.num
    if (_.isUndefined(num)) { return }
    this.props.onClick && this.props.onClick(num)
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
          value={this.state.player}
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
        <div className="resource-item" key={index}>
          <label>{name}</label>
          <i className={`icon-resources icon-resources-${index}`}></i>
          <input
            value={resoueces[index]}
            onChange={(ev) => this.handleValueChange(ev.target.value, index)}
            type="number"
            min={0}
            max={0x7fffffff}
          />
        </div>
      )
    })
    return (
      <div className="resource-list">
        {eles}
        <div className="resource-item">
          <button onClick={this.handleModify}>修改资源</button>
        </div>
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
      objModalVisible: false,
      objIndex: undefined,
      creatureModalVisible: false,
      creatureIndex: undefined,
    }
  }
  render () {
    let disabled = _.isUndefined(this.props.game.player)    // 游戏还未开始

    return (
      <div className="tab-item">
        <PlayerSelect
          disabled={disabled}
          onSelect={(player) => this.setState({player: player, currentHero: undefined})}
          value={this.state.player}
          onRefresh={this.fetchData}
        />

        {this.renderHeroSelect()}

        {this.renderForm()}
      </div>
    )
  }
  renderHeroSelect () {
    const heros = _.filter(this.state.heros, {player: this.state.player})
    const options = _.map(heros, (h) => {
      return (
        <HeroAvator
          active={h.num === this.state.currentHero}
          key={h.num}
          hero={h}
          onClick={this.handleHeroSelect}
        />
      )
    })
    let disabled = _.isEmpty(heros)
    let choose
    if (!disabled) {
      choose = (
        <div className="hero-list">
          {options}
        </div>
      )
    }
    return (
      <div className={`hero-select ${disabled ? 'disabled' : ''}`}>
        选择需要修改的英雄：
        <button disabled={disabled} onClick={this.handleRefreshHero}>刷新当前英雄数据</button>
        {choose}
      </div>
    )
  }
  renderForm () {
    if (_.isUndefined(this.state.currentHero) || _.get(this.state.heroInfo, 'num') !== this.state.currentHero) { return }

    const info = this.state.heroInfo

    return (
      <div className="hero-info">
        {this.renderProperySection(info)}
        {this.renderSkillSection(info)}
        {this.renderObjectSection(info)}
        {this.renderCreatureSection(info)}

        {this.renderObjectModal()}
        {this.renderCreatureModal()}
      </div>
    )
  }
  renderProperySection (info) {
    const baseFields = ['魔法值', '移动力', '经验', '攻击', '防御', '力量', '知识']
    const eles = _.map(baseFields, (field, index) => {
      return (
        <li className="info-item" key={index}>
          <label>{field}</label>
          <input type="number" min={0} max={BYTES_MAX[4]} value={info[field]} onChange={this.handleProperyInputChange(field)} />
        </li>
      )
    })
    const fields = _.concat(['士气幸运'], baseFields)
    return (
      <div className="info-section">
        <h2>基础属性 <button className="confirm" onClick={this.handleProperyModify(fields)}>确认修改</button></h2>
        <ul className="info-list">
          {eles}

          <li className="info-item">
            <label>最高士气幸运</label>
            <input type="checkbox" checked={info['士气幸运'] === 0xC0} onChange={(ev) => {
              let checked = ev.nativeEvent.target.checked
              let value = checked ? 0xC0 : 0
              this.handleProperyChange('士气幸运', value)
            }} />
          </li>
        </ul>
      </div>
    )
  }
  renderSkillSection (info) {
    const skillFields = [
      '寻路术等级', '箭术等级', '后勤学等级', '侦察术等级', '外交术等级', '航海术等级', '领导术等级', '智慧术等级', '神秘术等级', '幸运术等级', '弹道术等级', '鹰眼术等级', '招魂术等级', '理财术等级', '火系魔法等级', '气系魔法等级', '水系魔法等级', '土系魔法等级', '学术等级', '战术等级', '炮术等级', '学习能力等级', '进攻术等级', '防御术等级', '智力等级', '魔力等级', '抵抗力等级', '急救术等级'
    ]
    const positionFields = ['寻路术位置', '箭术位置', '后勤学位置', '侦察术位置', '外交术位置', '航海术位置', '领导术位置', '智慧术位置', '神秘术位置', '幸运术位置', '弹道术位置', '鹰眼术位置', '招魂术位置', '理财术位置', '火系魔法位置', '气系魔法位置', '水系魔法位置', '土系魔法位置', '学术位置', '战术位置', '炮术位置', '学习能力位置', '进攻术位置', '防御术位置', '智力位置', '魔力位置', '抵抗力位置', '急救术位置']
    const fields = _.concat([], positionFields, skillFields, ['技能个数'])
    const levels = {0: '-', 1: '初级', 2: '中级', 3: '高级'}

    const eles = _.map(skillFields, (field, index) => {
      return (
        <li className="info-item col-7" key={index}>
          <i className={`icon-skills icon-skills-${index}`}></i>
          <select value={info[field]} onChange={(ev) => {
            let value = Number(ev.nativeEvent.target.value)
            let values = [value]
            let fields = [field]
            if (value !== 0 && info[field] === 0) {
              // 学习技能
              fields.push(positionFields[index])
              fields.push('技能个数')
              values.push(index + 1)
              values.push(info['技能个数'] + 1)
            } else if (value === 0 && info[field] !== 0) {
              // 移除技能
              fields.push(positionFields[index])
              fields.push('技能个数')
              values.push(0)
              values.push(info['技能个数'] - 1)
            }
            this.handleMultiProperyChange(fields, values)
          }}>
            <option value={0}>-</option>
            <option value={1}>{levels[1]}</option>
            <option value={2}>{levels[2]}</option>
            <option value={3}>{levels[3]}</option>
          </select>
        </li>
      )
    })
    return (
      <div className="skill-section">
        <h2>
          28项技能
          <button className="confirm" onClick={this.handleLearnAllMagic}>学会所有魔法</button>
          <button className="confirm" onClick={this.handleProperyModify(fields)}>确认修改</button>
        </h2>

        <div>
          <button onClick={() => {
            let values = _.concat(
              _.map(positionFields, (f, i) => i+1),
              _.map(skillFields, () => 3)
            )
            values.push(28)
            this.handleMultiProperyChange(fields, values)
          }}>全部学习</button>
          <button onClick={() => {
            this.handleMultiProperyChange(
              fields, _.times(fields.length, () => 0)
            )
          }}>全部移除</button>
        </div>

        <ul className="info-list">
          {eles}
        </ul>
      </div>
    )
  }
  renderObjectSection (info) {
    // 行囊背包
    const fields = []
    const eles = _.times(64, (i) => {
      let field = '行囊' + _.padStart(i+1, 2, '0')
      let properyField = '行囊' + _.padStart(i+1, 2, '0') + '属性'
      fields.push(field)
      fields.push(properyField)
      let cleanBtn
      if (ALL_OBJECTS[info[field]]) {
        cleanBtn = (<button onClick={() => {
          this.handleMultiProperyChange(
            [field, properyField],
            [0xffffffff, 0xffffffff]
          )
        }}>清空</button>)
      }
      return (
        <li className="info-item col-8" key={i}>
          <div className="object-item">
            <label>{ALL_OBJECTS[info[field]]}</label>
            <i className={`icon icon-objects-${info[field]}`}></i>
            <div>
              {cleanBtn}
              <button onClick={() => {
                this.setState({objIndex: i, objModalVisible: true})
              }}>修改</button>
            </div>
          </div>
        </li>
      )
    })
    return (
      <div className="object-section">
        <h2>行囊背包 <button className="confirm" onClick={this.handleProperyModify(fields)}>确认修改</button></h2>
        <ul className="info-list">
          {eles}
        </ul>
      </div>
    )
  }
  renderObjectModal () {
    const excludeObjs = [0x00, 0x01, 0x03]    // 不显示的物品
    const eles = []
    _.each(ALL_OBJECTS, (name, code) => {
      code = Number(code)
      if (_.includes(excludeObjs, code)) { return }
      eles.push(
        <li key={code} onClick={() => {
          let i = this.state.objIndex
          if (!_.isUndefined(i)) {
            let field = '行囊' + _.padStart(i+1, 2, '0')
            let properyField = '行囊' + _.padStart(i+1, 2, '0') + '属性'
            this.handleMultiProperyChange(
              [field, properyField],
              [code, 0xffffffff]
            )
          }
          this.setState({objIndex: undefined, objModalVisible: false})
        }} className="object-item col-8">
          {name}
          <i className={`icon icon-objects-${code}`}></i>
        </li>
      )
    })
    return (
      <Modal visible={this.state.objModalVisible} onClose={() => {
        this.setState({objIndex: undefined, objModalVisible: false})
      }}>
        <ul className="object-list">
          {eles}
        </ul>
      </Modal>
    )
  }
  renderCreatureSection (info) {
    // 兵种分配
    const fields = []
    const eles = _.times(7, (i) => {
      let field = `第${i+1}格兵数量`
      let typeField = `第${i+1}格兵兵种`
      fields.push(field)
      fields.push(typeField)

      let num = info[field]
      let type = info[typeField]
      let disabled = num === 0 || type === 0xffffffff
      return (
        <li className="info-item col-7" key={i}>
          <div className="creature-item">
            <label onClick={() => { this.setState({creatureIndex: i, creatureModalVisible: true}) }}>{ALL_CREATURES[info[typeField]]}</label>
            <i className={`icon icon-creatures-${type}`} onClick={() => { this.setState({creatureIndex: i, creatureModalVisible: true}) }}></i>
            <input
              type="number"
              min={0}
              max={BYTES_MAX[4]}
              value={num}
              onChange={this.handleProperyInputChange(field)}
            />
            <button disabled={disabled} onClick={() => this.handleDivideCreature(i)}>一键分兵</button>
            <button disabled={disabled} onClick={() => this.handleAVGDivideCreature(i)}>平均分兵</button>
          </div>
        </li>
      )
    })
    return (
      <div className="creature-section">
        <h2>
          兵种分配
          <button onClick={this.handleMergeCreature}>合并相同兵种</button>
          <button className="confirm" onClick={this.handleProperyModify(fields)}>确认修改</button>
        </h2>
        <ul className="info-list">
          {eles}
        </ul>
      </div>
    )
  }
  renderCreatureModal () {
    const eles = []
    _.each(ALL_CREATURES, (name, code) => {
      if (!name) { return }
      code = Number(code)
      eles.push(
        <li key={code} onClick={() => {
          let i = this.state.creatureIndex
          if (!_.isUndefined(i)) {
            let field = `第${i+1}格兵兵种`
            this.handleProperyChange(field, code)
          }
          this.setState({creatureIndex: undefined, creatureModalVisible: false})
        }} className="object-item col-8">
          {name}
          <i className={`icon icon-creatures-${code}`}></i>
        </li>
      )
    })
    return (
      <Modal visible={this.state.creatureModalVisible} onClose={() => {
        this.setState({creatureIndex: undefined, creatureModalVisible: false})
      }}>
        <ul className="object-list">
          {eles}
        </ul>
      </Modal>
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
  handleHeroSelect = (num) => {
    let currentHero = Number(num)
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
      this.handleProperyChange(field, value)
    }
  }
  handleProperyChange = (field, value) => {
    value = Number(value)
    let max = BYTES_MAX[HERO_OFFSET_MAP[field][1]]
    if (value > max) { value = max }
    let heroInfo = _.assign({}, this.state.heroInfo, {[field]: value})
    this.setState({heroInfo})
  }
  handleMultiProperyChange = (fields, values) => {
    let data = {}
    _.each(fields, (field, index) => {
      let value = Number(values[index])
      let max = BYTES_MAX[HERO_OFFSET_MAP[field][1]]
      if (value > max) { value = max }
      data[field] = value
    })
    let heroInfo = _.assign({}, this.state.heroInfo, data)
    this.setState({heroInfo})
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
  handleLearnAllMagic = () => {
    let currentHero = this.state.currentHero
    if (currentHero >= 0) {
      axios.put(`/api/v1/heros/${currentHero}/magic`, {}).then((res) => {
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

  filterAllEmptyCreaturePostion = (index) => {
    // 过滤所有兵种为空的栏位
    const info = this.state.heroInfo
    let positions = []
    _.times(7, (i) => {
      if (index === i) { return }
      let field = `第${i+1}格兵数量`
      let typeField = `第${i+1}格兵兵种`
      let num = info[field]
      let type = info[typeField]
      if (num === 0 || type === 0xffffffff) { positions.push(i) }
    })
    return positions
  }
  handleDivideCreature = (index) => {
    // 一键分兵：每个空格分1个兵
    const info = this.state.heroInfo

    let field = `第${index+1}格兵数量`
    let typeField = `第${index+1}格兵兵种`
    let num = info[field]
    let type = info[typeField]

    if (num <= 1 || type === 0xffffffff) { return }

    const fields = []
    const values = []
    let positions = this.filterAllEmptyCreaturePostion(index)
    if (_.isEmpty(positions)) { return }

    _.each(positions, (i) => {
      let f = `第${i+1}格兵数量`
      let t = `第${i+1}格兵兵种`
      if (num <= 1) { return }   // 兵数不足，不再分配

      fields.push(f)
      fields.push(t)
      values.push(1)      // 修改当前栏位兵数
      values.push(type)   // 修改当前栏位兵种
      num--
    })
    fields.push(field)
    values.push(num)
    this.handleMultiProperyChange(fields, values)
  }
  handleAVGDivideCreature = (index) => {
    // 平均分兵：为所有空格平均分配兵种
    const info = this.state.heroInfo

    let field = `第${index+1}格兵数量`
    let typeField = `第${index+1}格兵兵种`
    let num = info[field]
    let type = info[typeField]

    if (num <= 1 || type === 0xffffffff) { return }

    const fields = []
    const values = []
    let positions = this.filterAllEmptyCreaturePostion(index)
    if (_.isEmpty(positions)) { return }

    let unit = Math.floor(num / (positions.length + 1))   // 每个空格分配的数量
    if (unit < 1) { unit = 1 }      // 每格至少分配1个单位
    _.each(positions, (i) => {
      let f = `第${i+1}格兵数量`
      let t = `第${i+1}格兵兵种`
      if (num <= unit) { return }   // 兵数不足，不再分配

      fields.push(f)
      fields.push(t)
      values.push(unit)   // 修改当前栏位兵数
      values.push(type)   // 修改当前栏位兵种
      num = num - unit
    })

    fields.push(field)
    values.push(num)
    this.handleMultiProperyChange(fields, values)
  }

  filterAllCreatureType = () => {
    // 计算各个兵种的数量
    const info = this.state.heroInfo
    const data = {}
    _.times(7, i => {
      let field = `第${i+1}格兵数量`
      let typeField = `第${i+1}格兵兵种`
      let num = info[field]
      let type = info[typeField]
      if (num === 0 || type === 0xffffffff) { return }    // 当前栏位为空
      if (!data[type]) { data[type] = 0 }
      data[type] += num
    })
    return data
  }
  handleMergeCreature = () => {
    // 将所有相同的兵种合并
    const data = this.filterAllCreatureType()
    let size = _.size(data)
    if (size === 7) { return }    // 没有相同的兵种

    const fields = []
    const values = []
    const allTypes = _.keys(data)   // 所有生物种类
    _.times(7, (i) => {
      let f = `第${i+1}格兵数量`
      let t = `第${i+1}格兵兵种`
      fields.push(f)
      fields.push(t)

      if (i >= size) {            // 清空该栏位
        values.push(0)
        values.push(0xffffffff)
      } else {
        values.push(data[allTypes[i]])
        values.push(allTypes[i])
      }
    })
    this.handleMultiProperyChange(fields, values)
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
        {!this.state.game.pid ? <p className="error">Heroes3.exe 游戏未运行</p> : ''}
        <p>
          <span>当前玩家色：{PLAYER_COLORS[this.state.game.player]}</span>
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
      <ResourceTab key={this.state.game.player} game={this.state.game} />
    )
  }
  renderHero () {
    if (!this.state.game.pid || this.state.tab !== 'hero') { return }
    return (
      <HeroTab key={this.state.game.player} game={this.state.game} />
    )
  }
  handleTabClick = (tab) => {
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
