import React from "react";
import WoundSizeSection from "./WoundSizeSection";
import TissueSection from "./TissueSection";
import SurroundingsSection from "./SurroundingsSection";
import CareDetailsSection from "./CareDetailsSection";

interface Props {
  currentSection: number;
  states: any;
  setters: any;
  errors: any;
}

export default function FormSections({ currentSection, states, setters, errors }: Props) {
  switch (currentSection) {
    case 0:
      return (
        <WoundSizeSection
          width={states.width}
          setWidth={setters.setWidth}
          height={states.height}
          setHeight={setters.setHeight}
          depth={states.depth}
          setDepth={setters.setDepth}
          errors={errors}
        />
      );
    case 1:
      return (
        <TissueSection
          granulationTissue={states.granulationTissue}
          setGranulationTissue={setters.setGranulationTissue}
          slough={states.slough}
          setSlough={setters.setSlough}
          necroticTissue={states.necroticTissue}
          setNecroticTissue={setters.setNecroticTissue}
          errors={errors}
        />
      );
    case 2:
      return (
        <SurroundingsSection
          borders={states.borders}
          setBorders={setters.setBorders}
          surroundingSkin={states.surroundingSkin}
          setSurroundingSkin={setters.setSurroundingSkin}
          edema={states.edema}
          setEdema={setters.setEdema}
          exudateAmount={states.exudateAmount}
          setExudateAmount={setters.setExudateAmount}
          exudateType={states.exudateType}
          setExudateType={setters.setExudateType}
          errors={errors}
        />
      );
    case 3:
      return (
        <CareDetailsSection
          debridement={states.debridement}
          setDebridement={setters.setDebridement}
          primaryDressing={states.primaryDressing}
          setPrimaryDressing={setters.setPrimaryDressing}
          secondaryDressing={states.secondaryDressing}
          setSecondaryDressing={setters.setSecondaryDressing}
          nextCareDate={states.nextCareDate}
          setNextCareDate={setters.setNextCareDate}
          careNotes={states.careNotes}
          setCareNotes={setters.setCareNotes}
          woundPain={states.woundPain}
          setWoundPain={setters.setWoundPain}
          skinProtection={states.skinProtection}
          setSkinProtection={setters.setSkinProtection}
          cleaningSolution={states.cleaningSolution}
          setCleaningSolution={setters.setCleaningSolution}
          woundPhoto={states.woundPhoto}
          setWoundPhoto={setters.setWoundPhoto}
        />
      );
    default:
      return null;
  }
}