import { mount } from '@vue/test-utils'
import Button from 'src/components/Button.vue'
import { createTestingPinia } from '@pinia/testing'
import { arStore } from '@/stores/ar'
import { describe, it, expect } from 'vitest'

/* 
    type: {
      type: String,
      default: 'primary',
    },
    label: {
      type: String,
      default: '',
    },
    route: {
      type: String,
      default: null,
    },
    gltfModelSrc: {
      type: String,
      required: false,
      default: '',
    },
    usdzModelSrc: {
      type: String,
      required: false,
      default: '',
    },
    soundSrc: {
      type: String,
      required: false,
      default: '',
    },
    arBannerLink: {
      type: String,
      required: false,
      default: '',
    },
    options: {
      type: Array,
      required: false,
      default: () => [],
    },
*/

describe('Button component', () => {
  it('should render its label correctly', () => {
    const buttonLabel = 'Test label'
    const wrapper = mount(Button, {
      props: {
        type: 'primary',
        label: buttonLabel,
      },
    })

    expect(wrapper.text()).toBe(buttonLabel)
  })
})
