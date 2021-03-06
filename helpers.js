const prefix = 'pf'
const refineArray = (arr, size) => arr.map(obj => { return { ...obj, index: obj.index % size } })

// Export all these following stuff before publish

export const SliderClasses = {
  wrapper: `${prefix}-slider-wrapper`,
  inner: `${prefix}-slider-inner`,
  slide: `${prefix}-slider-slide`,
  indicators: `${prefix}-slider-pagination`,
  indicatorItem: `${prefix}-slider-pagination-item`,
  controller: `${prefix}-slider-nav`,
  disabledCtrl: `${prefix}-slider-nav-disabled`,
  nextCtrl: `${prefix}-next-nav`,
  prevCtrl: `${prefix}-prev-nav`,
  turnOffMouseEvent: `${prefix}-slider-mouse-event-off`
}

// The logic is compicated! Stay tune before reading this func
export const getSlideMovementData = (slider, direction, toIndex) => {
  let { totalSlide, $slider } = slider
  totalSlide *= 3

  const sliderWidth = $slider.width()
  const slideWidth = calculateSlideSize(slider)
  const { curr, slidesToShow, slidesToScroll, gutter } = slider.opts

  // Created this array to check if the next index is in the curr-showing-slides or not
  const currIndexes = []
  for (let i = 0; i < slidesToShow; i++) { currIndexes.push((curr + i) % totalSlide) }

  let nextIndex
  let nextSlidesReadyPos = [], nextSlidesNewPos = [], currSlidesNewPos = []
  let slidesMove

  if (direction === "next") {
    // Calculate number of slides to move
    if (toIndex !== undefined) {
      if (currIndexes.includes(toIndex)) {
        slidesMove = currIndexes.indexOf(toIndex) - currIndexes.indexOf(curr)
      } else slidesMove = slidesToShow
    } else slidesMove = slidesToScroll

    nextIndex = toIndex !== undefined ? toIndex : (curr + slidesToScroll) % totalSlide

    // Calculate next slides ready-position - where the next slides stay and be ready to move in
    let firstX
    if (currIndexes.includes(nextIndex)) {
      firstX = slider.$slider.children().eq(nextIndex).position().left
    } else firstX = sliderWidth + gutter

    for (let i = 0; i < slidesToShow; i++) {
      const readyX = firstX + (slideWidth + gutter) * i

      if (!currIndexes.includes((nextIndex + i) % totalSlide)) {
        nextSlidesReadyPos.push({ index: nextIndex + i, readyX })
      }

      nextSlidesNewPos.push({ index: nextIndex + i, newX: readyX - (gutter + slideWidth) * slidesMove })
    }
  } else if (direction === "prev") {
    // Calculate number of slides to move
    if (toIndex !== undefined) {
      const lastIndex = (toIndex + slidesToShow - 1) % totalSlide
      if (currIndexes.includes(lastIndex)) {
        slidesMove = currIndexes.indexOf((curr + slidesToShow - 1) % totalSlide) - currIndexes.indexOf(lastIndex)
      } else slidesMove = slidesToShow
    } else slidesMove = slidesToScroll

    nextIndex = toIndex !== undefined ? toIndex : (totalSlide + (curr - slidesToScroll)) % totalSlide

    // Calculate next slides ready-position - where the next slides stay and be ready to move in
    let firstX // left position of the last slide in next slides
    if (currIndexes.includes((nextIndex + slidesToShow - 1) % totalSlide)) {
      firstX = slider.$slider.children().eq((nextIndex + slidesToShow - 1) % totalSlide).position().left
    } else firstX = -(slideWidth + gutter)

    for (let i = 0; i < slidesToShow; i++) {
      const readyX = firstX - (slideWidth + gutter) * (slidesToShow - i - 1)

      if (!currIndexes.includes((nextIndex + i) % totalSlide)) {
        nextSlidesReadyPos.push({ index: nextIndex + i, readyX })
      }

      nextSlidesNewPos.push({ index: nextIndex + i, newX: readyX + (gutter + slideWidth) * slidesMove })
    }
  }

  // Calculate new position for curr-showing-slides
  for (let i = 0; i < slidesToShow; i++) {
    const $slide = slider.$slider.children().eq((curr + i) % totalSlide)
    const slideX = $slide.position().left

    let newX
    if (direction === 'next') newX = slideX - (gutter + slideWidth) * slidesMove
    else if (direction === 'prev') newX = slideX + (gutter + slideWidth) * slidesMove

    if (slider.moveByDrag) {
      const currLeft = slider.$slider.children().eq(curr % totalSlide).position().left
      if (direction === 'prev') newX = slideX + (sliderWidth - currLeft) + gutter
      else if (direction === 'next') newX = slideX - (sliderWidth + currLeft) - gutter
    }

    currSlidesNewPos.push({ index: curr + i, newX })
  }
  // debugger

  ////////////

  nextSlidesReadyPos = refineArray(nextSlidesReadyPos, totalSlide)
  nextSlidesNewPos = refineArray(nextSlidesNewPos, totalSlide)
  currSlidesNewPos = refineArray(currSlidesNewPos, totalSlide)

  return { nextIndex, nextSlidesReadyPos, currSlidesNewPos, nextSlidesNewPos }
}

export const calculateSlideSize = (slider) => {
  const { gutter, slidesToShow } = slider.opts
  const wrapperWidth = slider.$slider.width()

  const slideWidth = (wrapperWidth - gutter * (slidesToShow - 1)) / slidesToShow

  return slideWidth
}