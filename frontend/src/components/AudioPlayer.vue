<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

  import { useI18n } from 'vue-i18n'

  const props = defineProps({
    src: {
      type: String,
      default: '',
    },
    fileMime: {
      type: String,
      default: '',
    },
    posterImg: {
      type: Object,
      default: () => ({}),
    },
    title: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
  })

  const { t } = useI18n()

  const audioPlayer = ref(null)
  const durationTime = ref(0)
  const currentTime = ref(0)
  const playPercent = ref(0)
  const isPlaying = ref(false)
  const currentTimeString = ref('00:00')
  const durationTimeString = ref('00:00')
  const timeline = ref(null)
  const isMuted = ref(false)

  const production = import.meta.env.PROD

  const devAssetsBaseUrl = computed(() => {
    if (window.location.href.includes('localhost')) {
      return import.meta.env.VITE_DEV_LOCAL_ASSETS_BASE_URL
    } else return import.meta.env.VITE_DEV_REMOTE_ASSETS_BASE_URL
  })

  function getFullFileSrc(fileSrc) {
    return `${
      production ? import.meta.env.VITE_ASSETS_BASE_URL : devAssetsBaseUrl.value
    }${fileSrc}`
  }

  function togglePlayPause() {
    if (isPlaying.value) audioPlayer.value.pause()
    else audioPlayer.value.play()
  }

  // Updates the current time and play percent:
  function updatePlayTime() {
    currentTime.value = audioPlayer.value.currentTime
    playPercent.value =
      100 * (audioPlayer.value.currentTime / durationTime.value)

    currentTimeString.value = new Date(currentTime.value * 1000)
      .toISOString()
      .slice(14, 19)

    durationTimeString.value = new Date(durationTime.value * 1000)
      .toISOString()
      .slice(14, 19)
  }

  // Adjusts the time of the audio player to match the desired timeline position
  // based on click event, playhead position is adjusted automatically:
  function seekAudio(event) {
    audioPlayer.value.currentTime =
      (durationTime.value *
        (event.clientX - timeline.value.getBoundingClientRect().left)) /
      timeline.value.getBoundingClientRect().width
  }

  function setPlayingState(state) {
    isPlaying.value = state
  }

  function toggleMute() {
    if (isMuted.value) {
      audioPlayer.value.muted = false
      isMuted.value = false
    } else {
      audioPlayer.value.muted = true
      isMuted.value = true
    }
  }

  function setDuration() {
    durationTime.value = audioPlayer.value.duration
  }

  onMounted(() => {
    audioPlayer.value.addEventListener('loadedmetadata', setDuration)
    audioPlayer.value.addEventListener('timeupdate', updatePlayTime)
    audioPlayer.value.addEventListener('play', setPlayingState.bind(null, true))
    audioPlayer.value.addEventListener(
      'pause',
      setPlayingState.bind(null, false)
    )
    audioPlayer.value.addEventListener(
      'ended',
      setPlayingState.bind(null, false)
    )
    timeline.value.addEventListener('click', seekAudio)
  })

  onBeforeUnmount(() => {
    audioPlayer.value.removeEventListener('loadedmetadata', setDuration)
    audioPlayer.value.removeEventListener('timeupdate', updatePlayTime)
    audioPlayer.value.removeEventListener('play', setPlayingState)
    audioPlayer.value.removeEventListener('pause', setPlayingState)
    audioPlayer.value.removeEventListener('ended', setPlayingState)
    timeline.value.removeEventListener('click', seekAudio)
  })

  const posterAltText = computed(() => {
    return props.posterImg.alternativeText
      ? props.posterImg.alternativeText
      : t('components.audioPlayer.defaultPosterImgAltText')
  })
</script>

<template>
  <div class="audio-player-container">
    <div class="audio-info-container">
      <div
        v-if="posterImg && Object.keys(posterImg).length !== 0"
        class="audio-poster-container"
      >
        <img
          :src="getFullFileSrc(posterImg.formats.small.url)"
          :alt="posterAltText"
          class="audio-poster-image"
        />
      </div>
      <span v-if="title || text" class="audio-info-text">
        <p v-if="title" class="audio-title">{{ title }}</p>
        <p v-if="text" class="audio-text">{{ text }}</p>
      </span>
    </div>
    <audio ref="audioPlayer">
      <source :src="getFullFileSrc(src)" :type="fileMime" />
      <track kind="captions" />
    </audio>
    <div class="audio-controls">
      <button
        class="play-pause-button"
        aria-label="Play Pause Audio Button"
        @click="togglePlayPause()"
      >
        <img
          src="@/assets/icons/play-button.svg"
          :alt="$t('components.audioPlayer.playButtonImageAltText')"
          :class="{ hidden: isPlaying }"
        />
        <img
          src="@/assets/icons/pause-button.svg"
          :alt="$t('components.audioPlayer.pauseButtonImageAltText')"
          :class="{ hidden: !isPlaying }"
        />
      </button>
      <div class="timeline-container">
        <div class="timeline-bar-container">
          <div
            class="playhead"
            :style="{
              'margin-left': `calc(${playPercent}% - var(--playhead-width) / 2)`,
            }"
          ></div>
          <div ref="timeline" class="timeline-progress-container">
            <div class="timeline-background"></div>
            <div
              class="timeline-played"
              :style="{ width: `${playPercent}%` }"
            ></div>
          </div>
        </div>
        <div class="timeline-time-container">
          <span class="current-time-text">
            <p>{{ currentTimeString }}</p>
          </span>
          <span class="duration-text">
            <p>{{ durationTimeString }}</p>
          </span>
        </div>
      </div>
      <button class="volume-button" @click="toggleMute()">
        <img
          src="@/assets/icons/volume-icon.svg"
          :alt="$t('components.audioPlayer.soundOnButtonImageAltText')"
          :class="{ hidden: isMuted }"
        />
        <img
          src="@/assets/icons/mute-icon.svg"
          :alt="$t('components.audioPlayer.soundOffButtonImageAltText')"
          :class="{ hidden: !isMuted }"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
  * {
    --playhead-width: 0.8rem;
    --audio-player-button-size: 2rem;
    --timeline-font-size: calc(1rem * var(--timeline-font-scale-factor));
  }

  .audio-player-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    width: calc(100% - (var(--gutter) * 2));
    padding: var(--gutter);
    color: white;
    background-color: var(--tertiary-color);
  }

  .audio-player-container audio {
    width: 100%;
  }

  .audio-info-container {
    display: flex;
    flex-direction: row;
    gap: var(--gutter);
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-bottom: var(--gutter);
  }

  .audio-poster-container {
    position: relative;
    display: block;
    flex-basis: 33%;
    max-width: 150px;
    max-height: 150px;
    aspect-ratio: 1;
  }

  .audio-poster-container img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .audio-info-text {
    flex: 1;
  }

  .audio-info-text p {
    margin: 0 0 0.5rem;
  }

  .audio-text {
    font-size: 0.9rem;
    color: var(--primary-color);
  }

  .audio-controls {
    display: flex;
    gap: var(--gutter);
    align-items: center;
    width: 100%;
  }

  .play-pause-button,
  .volume-button {
    padding: 0;
    cursor: pointer;
    background-color: transparent;
    border: none;
    outline: none;
  }

  .play-pause-button {
    width: var(--audio-player-button-size);
    min-width: var(--audio-player-button-size);
    height: var(--audio-player-button-size);
  }

  .volume-button {
    width: calc(var(--audio-player-button-size) * 0.65);
    min-width: calc(var(--audio-player-button-size) * 0.65);
    height: calc(var(--audio-player-button-size) * 0.65);
  }

  .play-pause-button img,
  .volume-button img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .play-pause-button img.hidden,
  .volume-button img.hidden {
    display: none;
  }

  .timeline-container {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: var(--audio-player-button-size);
  }

  .timeline-bar-container {
    display: grid;
    align-items: center;
    justify-items: start;
    width: 100%;
    height: var(--playhead-width);
  }

  .timeline-time-container {
    display: flex;
    justify-content: space-between;
  }

  .playhead {
    z-index: 2;
    grid-area: 1 / 1;
    width: var(--playhead-width);
    height: var(--playhead-width);
    background: var(--primary-color);
    border-radius: 50%;
  }

  .timeline-progress-container {
    display: grid;
    grid-area: 1 / 1;
    width: 100%;
  }

  .timeline-background,
  .timeline-played {
    grid-area: 1 / 1;
    width: 100%;
    height: 0.15rem;
    background: white;
    border-radius: 50px;
  }

  .timeline-played {
    background: var(--primary-color);
  }

  .current-time-text p,
  .duration-text p {
    margin: 0;
    font-size: var(--timeline-font-size);
  }

  .current-time-text {
    left: 0;
    color: var(--primary-color);
  }

  .duration-text {
    right: 0;
    color: white;
  }
</style>
