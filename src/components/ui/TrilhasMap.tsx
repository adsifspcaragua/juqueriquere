import mapImage from '../../assets/img/map.png';

interface MapProps {
  id?: number;
  onHover?: () => void;
  onClick?: () => void;
}

export default function Map({ id, onHover, onClick }: MapProps) {

  const pathData = [
    { id: 1, stroke: "#FF0000", d: "M886 617L926.5 584L950 537L961.5 482L933 434L968.5 386L972 327.5L1011.5 288L1026 211L974.5 179L921.5 194.5L864 187L802 146.5L758.5 102.5L702 88.5L659.5 53.5L604 61.5L525 109L455 93L397 144.5" },
    { id: 2, stroke: "#FFEA00", d: "M457.5 155L446.5 205L452.5 273.5L442.5 332.5L370.5 412.5L367 487.5L402 530" },
    { id: 6, stroke: "#00AEFF", d: "M930.5 672L882 649.5L842 607.5L812 558L781.5 518.5L784 456L777 403.5L780.5 346.5L754.5 285L721.5 238.5L610.5 218L557.5 240.5L539 298L520 340L513.5 409.5L530 462.5L536.5 517.5L507 564L454 569L399 588.5L352.5 626L313.5 661" },
    { id: 7, stroke: "#BCEA00", d: "M464 910L420 955.5L377.5 924L287.5 986L228 969.5L178 993L141 1046L97 1098" },
    { id: 3, stroke: "#78E678", d: "M464.5 910L433.5 870L415 860.5L390.5 841.5L351 803.5L318 757.5" },
    { id: 4, stroke: "#00C040", d: "M911.5 744.5L899.5 811L872 857L867 915.5L845 962.5L801.5 1000.5L747 1005.5L681 991L609.5 986L551 997L523 946L464.5 910" }
  ];

  const targetPathId = id ? id : undefined;

  const pathsToRender = targetPathId 
    ? pathData.filter(path => path.id === targetPathId)
    : pathData;

  return (
    <svg width="auto" height="auto" viewBox="0 0 1146 1146" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1146" height="1146" fill="url(#pattern0_4406_1032)" />
      
      {pathsToRender.map((path) => (
        <path
          key={path.id}
          d={path.d}
          stroke={path.stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          onMouseEnter={onHover}
          onClick={onClick}
        />
      ))}

      <defs>
        <pattern 
          id="pattern0_4406_1032" 
          patternUnits="userSpaceOnUse" 
          width="1146" 
          height="1146"
        >
          <image 
            href={mapImage} 
            width="1146" 
            height="1146" 
            preserveAspectRatio="xMidYMid slice" 
          />
        </pattern>
      </defs>
    </svg>
  );
}