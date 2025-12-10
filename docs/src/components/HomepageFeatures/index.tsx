import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from "@docusaurus/Link";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
  to?: string; 
};

const FeatureList: FeatureItem[] = [
  
  {
    title: 'Learn',
    Svg: require('@site/static/img/learn.svg').default,
    to: '/docs/next/learn/introduction',
    description: (
      <>
        Learn how to build verifiable, decentralized AI services with secure messaging, biometrics, NFC ID reading, credential flows, ethical monetization, and DID-based discoverability.
      </>
    ),
    
  },
  {
    title: 'Build',
    Svg: require('@site/static/img/use.svg').default,
    to: '/docs/next/build/intro',
    description: (
      <>
        Learn how to build verifiable, decentralized AI services with secure messaging, biometrics, NFC ID reading, credential flows, ethical monetization, and DID-based discoverability.
        </>
    ),
  },
  
];

function Feature({title, to, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <Link to={to}>
        <div className="text--center">
          <Svg className={styles.featureSvg} role="img" />
        </div>
      </Link>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
