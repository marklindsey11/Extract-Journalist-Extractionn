import type { GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from 'next'
import queryString from 'query-string';
import Head from 'next/head'
import Image from 'next/image'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';

import Layout from '../../components/Layout'
import { API_URL } from '../../lib/constants';

import { IRefTagListingResponse, ISiteListingResponse } from '../../lib/types';
import Link from 'next/link';
import { getRefTagLink } from '../../lib/util';

export default function Tags({ response, query, site, sites }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Layout title="Tags listing">
      <Container>
        <Form>
          <Row className="align-items-center">
            <Col>
              <Form.Label htmlFor="q" visuallyHidden>
                Search
              </Form.Label>
              <Form.Control
                id="q"
                name="q"
                defaultValue={query}
                placeholder="Search in tagged entity names..."
              />
            </Col>
            <Col xs="auto">
              <InputGroup>
                <InputGroup.Text>
                  Source site
                </InputGroup.Text>
                <Form.Select id="site" name="site" defaultValue={site}>
                  <option value="">(all sites)</option>
                  {sites.map((s) =>
                    <option value={s}>{s}</option>
                  )}
                </Form.Select>
              </InputGroup>
            </Col>
            <Col xs="auto">
              <Button type="submit" id="submit">
                Filter
              </Button>
            </Col>
          </Row>
        </Form>

        <Table>
          <thead>
            <tr>
              <th>Count</th>
              <th>Tag</th>
              <th>Category</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {response.results.map((reftag) => (
              <tr>
                <td>{reftag.count}</td>
                <td>
                  <Link href={getRefTagLink(reftag)}>{reftag.text}</Link>
                  {!!reftag.cluster && (
                    <>{'*'}</>
                  )}
                </td>
                <td><code>{reftag.category}</code></td>
                <td>
                  <a target="_blank" href={reftag.ref.url}>{reftag.ref.title}</a>
                  {' - '}{reftag.ref.site}
                </td>
              </tr>
            ))}
          </tbody>

        </Table>
      </Container>
    </Layout>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const query = '' + (context.query.q || '');
  const site = '' + (context.query.site || '');
  const apiUrl = queryString.stringifyUrl({
    'url': `${API_URL}/tags`,
    'query': {
      ...context.query
    }
  })
  const res = await fetch(apiUrl);
  const data = await res.json() as IRefTagListingResponse

  const sitesResponse = await fetch(`${API_URL}/sites`);
  const sitesData = await sitesResponse.json() as ISiteListingResponse
  const sites = sitesData.results.map((s) => s.site);

  return {
    props: { response: data, query, site, sites },
  }
}
