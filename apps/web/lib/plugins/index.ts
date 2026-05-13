import { DonorPlugin } from '@hlb/plugin-donor'
import { BidsPlugin }  from '@hlb/plugin-bids'
import { registerPlugin } from './registry'

registerPlugin(DonorPlugin)
registerPlugin(BidsPlugin)

export { getRegisteredPlugins, getPlugin } from './registry'
